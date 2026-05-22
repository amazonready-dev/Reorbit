import {
  Zap,
  Languages,
  BarChart3,
  Clock,
  Shield,
  Wand2,
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI copywriter built in",
    body: "Every subject line, every body, every CTA — generated for the specific customer and product. Zero templates.",
  },
  {
    icon: Clock,
    title: "Perfect timing",
    body: "We learn when each customer opens and clicks, then send when they're most likely to convert.",
  },
  {
    icon: Languages,
    title: "27 languages, native quality",
    body: "Sell globally. Reorbit writes in the customer's own language with brand-aware tone.",
  },
  {
    icon: BarChart3,
    title: "Revenue attribution, not vanity",
    body: "See exactly which messages drove which orders. We report dollars earned, not opens.",
  },
  {
    icon: Zap,
    title: "Live in 5 minutes",
    body: "One-click Shopify install. No flow builders, no Klaviyo migration headaches.",
  },
  {
    icon: Shield,
    title: "GDPR-ready & safe",
    body: "EU data residency, unsubscribe honored everywhere, suppression list synced across channels.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            Why Reorbit
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Built for stores that <br className="hidden md:block" />
            <span className="text-gradient-brand">refuse to leave money on the table.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-surface p-8 hover:bg-surface-elevated transition"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-brand/15 grid place-items-center mb-4">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
