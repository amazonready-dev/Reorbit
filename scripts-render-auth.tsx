import * as React from 'react'
import { render } from '@react-email/components'
import { SignupEmail } from './src/lib/email-templates/signup'
import { InviteEmail } from './src/lib/email-templates/invite'
import { MagicLinkEmail } from './src/lib/email-templates/magic-link'
import { RecoveryEmail } from './src/lib/email-templates/recovery'
import { EmailChangeEmail } from './src/lib/email-templates/email-change'
import { ReauthenticationEmail } from './src/lib/email-templates/reauthentication'

const SITE = 'ai-app-scale-up'
const URL = 'https://ai-app-scale-up.lovable.app'
const E = 'user@example.test'

const cases: Array<[string, React.ReactElement]> = [
  ['signup', <SignupEmail siteName={SITE} siteUrl={URL} recipient={E} confirmationUrl={URL} />],
  ['invite', <InviteEmail siteName={SITE} siteUrl={URL} confirmationUrl={URL} />],
  ['magiclink', <MagicLinkEmail siteName={SITE} confirmationUrl={URL} />],
  ['recovery', <RecoveryEmail siteName={SITE} confirmationUrl={URL} />],
  ['email_change', <EmailChangeEmail siteName={SITE} oldEmail={E} email={E} newEmail="new@example.test" confirmationUrl={URL} />],
  ['reauthentication', <ReauthenticationEmail token="123456" />],
]

for (const [name, el] of cases) {
  try {
    const html = await render(el)
    const text = await render(el, { plainText: true })
    console.log(`✓ ${name}: html ${html.length}b, text ${text.length}b`)
  } catch (e: any) {
    console.log(`✗ ${name}: ${e.message}`)
  }
}
