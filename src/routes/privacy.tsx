import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Reorbit" },
      {
        name: "description",
        content:
          "How Reorbit collects, uses, stores, and protects merchant and customer data.",
      },
      { property: "og:title", content: "Privacy Policy — Reorbit" },
      {
        property: "og:description",
        content:
          "How Reorbit collects, uses, stores, and protects merchant and customer data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Reorbit
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mt-2">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <div className="prose prose-invert mt-10 space-y-8 text-foreground/90 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">
          <section>
            <h2>1. Who we are</h2>
            <p>
              Reorbit ("we", "us") is an app installed by Shopify merchants to send
              AI-generated post-purchase upsell and win-back communications. This
              policy describes how we handle data we receive from Shopify and from
              merchants using our service. Contact:{" "}
              <a href="mailto:privacy@reorbit.dev" className="underline">
                privacy@reorbit.dev
              </a>
              .
            </p>
          </section>

          <section>
            <h2>2. Data we collect</h2>
            <p>From the connected Shopify store, with the merchant's consent:</p>
            <ul>
              <li>Shop domain, shop email, plan, currency, installed Shopify scopes.</li>
              <li>
                Order data: order number, total, currency, financial status, fulfillment
                status, line items, customer ID, customer email, order timestamps.
              </li>
              <li>Product catalogue used to generate recommendations.</li>
            </ul>
            <p>
              From end-customers receiving our emails: email address, unsubscribe
              status, basic delivery telemetry (sent, bounced, complained).
            </p>
          </section>

          <section>
            <h2>3. How we use it</h2>
            <ul>
              <li>To generate personalised upsell and win-back emails on the merchant's behalf.</li>
              <li>To send those emails from the merchant-configured sending domain.</li>
              <li>To measure attributed revenue and surface it in the merchant dashboard.</li>
              <li>To operate, secure, and improve the service.</li>
            </ul>
            <p>We do not sell personal data. We do not use it to train third-party AI models.</p>
          </section>

          <section>
            <h2>4. Sub-processors</h2>
            <ul>
              <li>Supabase (database + storage, EU region).</li>
              <li>Cloudflare (edge compute + CDN).</li>
              <li>Resend (email delivery).</li>
              <li>OpenAI / Google (model inference; data not retained for training).</li>
            </ul>
          </section>

          <section>
            <h2>5. Retention</h2>
            <p>
              Order and customer data is retained while the app is installed. On
              uninstall the shop is marked inactive; 48 hours later, on receipt of
              Shopify's <code>shop/redact</code> webhook, we permanently delete all
              shop and customer data. Individual customers can be redacted earlier
              via Shopify's <code>customers/redact</code> webhook.
            </p>
          </section>

          <section>
            <h2>6. Your rights (GDPR / CCPA)</h2>
            <p>
              Merchants and their customers can request access, correction, export,
              or deletion of personal data by emailing{" "}
              <a href="mailto:privacy@reorbit.dev" className="underline">
                privacy@reorbit.dev
              </a>
              . Customers can also use the one-click unsubscribe link in every email.
            </p>
          </section>

          <section>
            <h2>7. Security</h2>
            <p>
              All traffic is encrypted with TLS. Shopify access tokens and API keys
              are stored encrypted at rest. Access to production data is limited to
              authorised personnel and audited.
            </p>
          </section>

          <section>
            <h2>8. Changes</h2>
            <p>
              We will post any updates to this policy on this page and, for material
              changes, notify merchants by email.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
