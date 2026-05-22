import { ShoppingBag, Brain, Send } from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "Customer buys",
    body: "Reorbit syncs the order, the products, and the customer's full purchase history from Shopify in real time.",
  },
  {
    icon: Brain,
    title: "AI decides what's next",
    body: "Our model picks the right upsell, the right cross-sell, or the right win-back offer — tuned to that exact customer, in their language.",
  },
  {
    icon: Send,
    title: "Revenue lands",
    body: "Personalized email or SMS goes out at the optimal moment. You see exactly how much each send made you, in real dollars.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            How it works
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Set it up once. <span className="text-gradient-brand">Earn forever.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative p-8 rounded-2xl bg-surface border border-border hover:border-primary/40 transition group"
            >
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-brand grid place-items-center font-display font-bold text-sm text-primary-foreground shadow-glow">
                {i + 1}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-brand/10 border border-primary/20 grid place-items-center mb-5 group-hover:scale-110 transition">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
