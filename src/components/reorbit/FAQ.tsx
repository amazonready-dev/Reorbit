const faqs = [
  {
    q: "How is Reorbit different from Klaviyo or Omnisend?",
    a: "Klaviyo gives you a flow builder. Reorbit gives you outcomes. You don't write subject lines, design templates, or build journeys — our AI does it per customer, per order. Most stores set Reorbit up in 5 minutes and never touch it again.",
  },
  {
    q: "Will it work alongside my existing email tool?",
    a: "Yes. Reorbit focuses on post-purchase and win-back — the highest-ROI moments. You can keep your existing newsletter tool and let Reorbit handle the revenue-generating automations.",
  },
  {
    q: "Do I need to write any copy or design any emails?",
    a: "No. Reorbit's AI writes every message in your brand voice and the customer's language, and renders them in a clean, mobile-first template. You can override anything if you want — but most users don't.",
  },
  {
    q: "How does pricing work after the trial?",
    a: "14-day free trial, then plans start at $29/mo based on monthly order volume. There are no per-email fees or hidden costs. If Reorbit doesn't pay for itself, you cancel — simple as that.",
  },
  {
    q: "Is my customer data safe?",
    a: "Yes. Reorbit is GDPR-compliant, stores data in EU regions by default, and only accesses the Shopify scopes it absolutely needs. Customer data is never used to train any model.",
  },
  {
    q: "When does the beta open?",
    a: "We're onboarding stores in waves throughout Q3. Waitlist members get priority — and the first 100 stores lock in 50% off forever.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            FAQ
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Questions, <span className="text-gradient-brand">answered.</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group p-6 rounded-2xl bg-surface border border-border open:border-primary/30 transition"
            >
              <summary className="flex items-center justify-between cursor-pointer font-display font-semibold list-none">
                {f.q}
                <span className="ml-4 w-6 h-6 rounded-full bg-surface-elevated grid place-items-center text-muted-foreground group-open:rotate-45 transition">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
