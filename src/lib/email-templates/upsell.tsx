import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface RecommendedProduct {
  product_id?: string
  title: string
  handle?: string
  price?: string
  why?: string
}

interface UpsellEmailProps {
  subject?: string
  preheader?: string
  bodyText?: string
  recipientName?: string
  shopDomain?: string
  recommendedProducts?: RecommendedProduct[]
  currency?: string
}

const SITE_NAME = 'Reorbit'

const UpsellEmail = ({
  preheader = 'A little something picked just for you',
  bodyText = 'Thanks again for your order! Based on what you picked up, we thought you might love these too.',
  recipientName,
  shopDomain,
  recommendedProducts = [],
  currency = 'USD',
}: UpsellEmailProps) => {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,'
  const storeBase = shopDomain ? `https://${shopDomain}` : '#'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preheader}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thanks for your order 💜</Heading>
          <Text style={text}>{greeting}</Text>
          <Text style={text}>{bodyText}</Text>

          {recommendedProducts.length > 0 && (
            <Section style={recsSection}>
              <Heading as="h2" style={h2}>
                You might also like
              </Heading>
              {recommendedProducts.map((p, i) => {
                const productUrl = p.handle
                  ? `${storeBase}/products/${p.handle}`
                  : storeBase
                return (
                  <Section key={`${p.product_id ?? i}`} style={productCard}>
                    <Text style={productTitle}>{p.title}</Text>
                    {p.price && (
                      <Text style={productPrice}>
                        {currency} {p.price}
                      </Text>
                    )}
                    {p.why && <Text style={productWhy}>{p.why}</Text>}
                    <Button style={smallButton} href={productUrl}>
                      View product
                    </Button>
                  </Section>
                )
              })}
            </Section>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            With love, the {SITE_NAME} team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: UpsellEmail,
  subject: (data: Record<string, any>) =>
    (data?.subject as string) || 'A little something picked just for you',
  displayName: 'Post-purchase upsell',
  previewData: {
    subject: 'Picked just for you',
    preheader: 'Based on your recent order',
    bodyText:
      'Thanks again for your order! Based on what you picked up, we thought these might be a perfect match.',
    recipientName: 'Jane',
    shopDomain: 'example.myshopify.com',
    currency: 'USD',
    recommendedProducts: [
      {
        product_id: '1',
        title: 'Cozy Wool Throw',
        handle: 'cozy-wool-throw',
        price: '79.00',
        why: 'Pairs beautifully with the linen set you just ordered.',
      },
      {
        product_id: '2',
        title: 'Aromatic Soy Candle',
        handle: 'aromatic-soy-candle',
        price: '24.00',
        why: 'A calming scent to round out your space.',
      },
    ],
  },
} satisfies TemplateEntry

export default UpsellEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
}
const container = { padding: '24px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0f0f1a',
  margin: '0 0 16px',
}
const h2 = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#0f0f1a',
  margin: '24px 0 12px',
}
const text = {
  fontSize: '15px',
  color: '#3f3f55',
  lineHeight: '1.55',
  margin: '0 0 16px',
}
const recsSection = { margin: '16px 0' }
const productCard = {
  border: '1px solid #ebebf2',
  borderRadius: '12px',
  padding: '16px',
  margin: '0 0 12px',
}
const productTitle = {
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: '#0f0f1a',
  margin: '0 0 4px',
}
const productPrice = {
  fontSize: '14px',
  color: '#6a3eea',
  margin: '0 0 8px',
  fontWeight: '600' as const,
}
const productWhy = {
  fontSize: '13px',
  color: '#55576a',
  lineHeight: '1.5',
  margin: '0 0 12px',
}
const smallButton = {
  backgroundColor: '#6a3eea',
  color: '#ffffff',
  fontSize: '13px',
  borderRadius: '8px',
  padding: '10px 16px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { border: 'none', borderTop: '1px solid #ebebf2', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999', margin: '0' }
