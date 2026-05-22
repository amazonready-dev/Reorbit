import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$29",
    blurb: "For stores finding their groove.",
    features: [
      "Up to 500 orders/month",
      "AI post-purchase upsells",
      "Win-back campaigns",
      "Email channel",
      "Revenue attribution dashboard",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$79",
    blurb: "For stores serious about retention.",
    features: [
      "Up to 5,000 orders/month",
      "Everything in Starter",
      "SMS channel",
      "Multi-language (27)",
      "A/B testing",
      "Priority AI model",
    ],
    cta: "Start free",
    highlight: true,
  },
  {
    name: "Scale",
    price: "$199",
    blurb: "For 7-figure brands.",
    features: [
      "Unlimited orders",
      "Everything in Growth",
      "Custom AI brand voice",
      "Dedicated success manager",
      "Advanced segmentation",
      "API access",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            Pricing
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Pays for itself in <span className="text-gradient-brand">the first week.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            14-day free trial. Cancel any time. No setup fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative p-8 rounded-2xl border transition ${
                t.highlight
                  ? "bg-gradient-to-b from-surface-elevated to-surface border-primary/50 shadow-glow scale-[1.02]"
                  : "bg-surface border-border hover:border-primary/30"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-brand text-primary-foreground text-xs font-semibold">
                  Most popular
                </div>
              )}
              <div className="font-display font-semibold text-xl">{t.name}</div>
              <div className="mt-4">
                <span className="font-display text-5xl font-bold">{t.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{t.blurb}</p>

              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`mt-8 block text-center px-5 py-3 rounded-full font-semibold transition ${
                  t.highlight
                    ? "bg-gradient-brand text-primary-foreground shadow-glow hover:scale-[1.03]"
                    : "bg-surface-elevated text-foreground border border-border hover:bg-surface"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
