/**
 * Server-only helper that renders the upsell email template and enqueues it
 * into the transactional_emails queue. Called from process-pending-orders
 * after the AI upsell has been generated and saved.
 *
 * Mirrors the suppression / unsubscribe-token / enqueue flow from
 * src/routes/lovable/email/transactional/send.ts, but runs without a user
 * JWT (uses the service-role admin client).
 */
import * as React from 'react'
import { render } from '@react-email/components'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { template as upsellTemplate } from '@/lib/email-templates/upsell'

const SITE_NAME = 'Reorbit'
const SENDER_DOMAIN = 'notify.reorbit.dev'
const FROM_DOMAIN = 'notify.reorbit.dev'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export type UpsellEmailInput = {
  offerId: string
  recipientEmail: string
  shopDomain: string
  currency?: string | null
  subject: string
  preheader?: string | null
  bodyText?: string | null
  recommendedProducts: Array<{
    product_id?: string
    title: string
    handle?: string
    price?: string
    why?: string
  }>
}

export type UpsellEmailResult =
  | { status: 'sent'; messageId: string }
  | { status: 'suppressed' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; error: string }

export async function enqueueUpsellEmail(
  input: UpsellEmailInput,
): Promise<UpsellEmailResult> {
  if (!input.recipientEmail) {
    return { status: 'skipped', reason: 'no_recipient_email' }
  }

  const normalizedEmail = input.recipientEmail.toLowerCase()
  const messageId = `upsell-${input.offerId}`

  // 1. Suppression check (fail-closed)
  const { data: suppressed, error: suppErr } = await supabaseAdmin
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()
  if (suppErr) return { status: 'failed', error: `suppression_check: ${suppErr.message}` }
  if (suppressed) {
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'upsell',
      recipient_email: input.recipientEmail,
      status: 'suppressed',
    })
    return { status: 'suppressed' }
  }

  // 2. Get-or-create unsubscribe token
  const { data: existing } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  let unsubscribeToken: string
  if (existing && !existing.used_at) {
    unsubscribeToken = existing.token
  } else if (!existing) {
    unsubscribeToken = generateToken()
    await supabaseAdmin
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true },
      )
    const { data: stored } = await supabaseAdmin
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()
    if (!stored) return { status: 'failed', error: 'unsubscribe_token_missing' }
    unsubscribeToken = stored.token
  } else {
    // token used but not in suppression — treat as suppressed
    return { status: 'suppressed' }
  }

  // 3. Render template
  const templateData = {
    subject: input.subject,
    preheader: input.preheader ?? undefined,
    bodyText: input.bodyText ?? undefined,
    shopDomain: input.shopDomain,
    currency: input.currency ?? 'USD',
    recommendedProducts: input.recommendedProducts,
  }
  const element = React.createElement(upsellTemplate.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })

  // 4. Log pending + enqueue
  await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'upsell',
    recipient_email: input.recipientEmail,
    status: 'pending',
  })

  const { error: enqErr } = await supabaseAdmin.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: input.recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: input.subject,
      html,
      text,
      purpose: 'transactional',
      label: 'upsell',
      idempotency_key: messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  } as any)

  if (enqErr) {
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'upsell',
      recipient_email: input.recipientEmail,
      status: 'failed',
      error_message: enqErr.message.slice(0, 1000),
    })
    return { status: 'failed', error: enqErr.message }
  }

  return { status: 'sent', messageId }
}
