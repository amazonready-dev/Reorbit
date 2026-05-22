import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Reorbit" },
      {
        name: "description",
        content: "Terms governing use of the Reorbit Shopify app.",
      },
      { property: "og:title", content: "Terms of Service — Reorbit" },
      {
        property: "og:description",
        content: "Terms governing use of the Reorbit Shopify app.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Reorbit
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-6">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mt-2">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <div className="prose prose-invert mt-10 space-y-8 text-foreground/90 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">
          <section>
            <h2>1. Agreement</h2>
            <p>
              By installing the Reorbit app from the Shopify App Store you ("Merchant")
              agree to these Terms. If you do not agree, uninstall the app.
            </p>
          </section>

          <section>
            <h2>2. The service</h2>
            <p>
              Reorbit reads orders and product catalogue from your Shopify store,
              uses AI to generate personalised post-purchase upsell and win-back
              emails, and sends them on your behalf via the email channel you
              configure.
            </p>
          </section>

          <section>
            <h2>3. Subscription and billing</h2>
            <ul>
              <li>Pricing follows the plans shown on reorbit.dev/#pricing.</li>
              <li>Charges are billed through Shopify's Billing API on a 30-day cycle.</li>
              <li>New installs receive a 14-day free trial; you will not be charged during the trial.</li>
              <li>You can change or cancel your plan at any time from the in-app settings or by uninstalling.</li>
            </ul>
          </section>

          <section>
            <h2>4. Acceptable use</h2>
            <ul>
              <li>You will only use Reorbit to email customers who have a lawful basis to receive marketing from you.</li>
              <li>You will honour unsubscribe requests, which Reorbit processes automatically.</li>
              <li>You will not use the service to send spam, illegal, deceptive, or harmful content.</li>
            </ul>
          </section>

          <section>
            <h2>5. Data</h2>
            <p>
              Our handling of personal data is governed by our{" "}
              <Link to="/privacy" className="underline">
                Privacy Policy
              </Link>
              . You remain the data controller for your customer data; Reorbit acts as
              processor.
            </p>
          </section>

          <section>
            <h2>6. Availability and changes</h2>
            <p>
              We provide the service on a commercially reasonable best-effort basis
              and may add, remove, or modify features over time. Material changes
              will be communicated by email.
            </p>
          </section>

          <section>
            <h2>7. Disclaimer and liability</h2>
            <p>
              The service is provided "as is" without warranty of any kind. To the
              maximum extent permitted by law, Reorbit's aggregate liability is
              limited to fees paid in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2>8. Termination</h2>
            <p>
              You may terminate at any time by uninstalling the app. We may suspend
              or terminate the service for breach of these Terms or for misuse of
              the platform.
            </p>
          </section>

          <section>
            <h2>9. Contact</h2>
            <p>
              Questions:{" "}
              <a href="mailto:support@reorbit.dev" className="underline">
                support@reorbit.dev
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
