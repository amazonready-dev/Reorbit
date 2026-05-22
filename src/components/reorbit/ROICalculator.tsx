import { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";

export function ROICalculator() {
  const [orders, setOrders] = useState(500);
  const [aov, setAov] = useState(60);

  const monthly = useMemo(() => {
    // Conservative assumption: Reorbit lifts repeat purchase rate by ~12pp,
    // and each retained customer buys ~1 extra time per month at AOV.
    const winBackOrders = orders * 0.12;
    const upsellRevenue = orders * aov * 0.08; // 8% AOV uplift via post-purchase upsell
    const winBackRevenue = winBackOrders * aov;
    const total = upsellRevenue + winBackRevenue;
    return {
      total: Math.round(total),
      upsell: Math.round(upsellRevenue),
      winBack: Math.round(winBackRevenue),
      yearly: Math.round(total * 12),
    };
  }, [orders, aov]);

  return (
    <section id="roi" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            ROI Calculator
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            How much is Reorbit <span className="text-gradient-brand">worth to you?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Inputs */}
          <div className="space-y-8 p-8 rounded-2xl bg-surface border border-border">
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-sm font-medium">Monthly orders</label>
                <span className="font-display text-2xl font-bold text-gradient-brand">
                  {orders.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={10000}
                step={50}
                value={orders}
                onChange={(e) => setOrders(Number(e.target.value))}
                className="w-full accent-[oklch(0.68_0.22_295)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>50</span>
                <span>10,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-sm font-medium">Average order value</label>
                <span className="font-display text-2xl font-bold text-gradient-brand">
                  ${aov}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={aov}
                onChange={(e) => setAov(Number(e.target.value))}
                className="w-full accent-[oklch(0.68_0.22_295)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$10</span>
                <span>$500</span>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="relative p-8 rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="flex items-center gap-2 text-sm font-medium opacity-80">
              <TrendingUp className="w-4 h-4" />
              Estimated extra revenue
            </div>
            <div className="font-display text-6xl font-bold mt-2 leading-none">
              ${monthly.total.toLocaleString()}
              <span className="text-2xl font-medium opacity-80">/mo</span>
            </div>
            <div className="text-sm mt-2 opacity-90">
              That's <strong>${monthly.yearly.toLocaleString()}</strong> per year.
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between border-t border-white/20 pt-3">
                <span className="opacity-80">Post-purchase upsells</span>
                <span className="font-semibold">${monthly.upsell.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Win-back campaigns</span>
                <span className="font-semibold">${monthly.winBack.toLocaleString()}/mo</span>
              </div>
            </div>

            <a
              href="#waitlist"
              className="mt-8 block w-full text-center px-5 py-3 rounded-full bg-background/90 text-foreground font-semibold hover:bg-background transition"
            >
              Claim this revenue →
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground max-w-xl mx-auto">
          Estimates based on aggregated benchmarks from post-purchase email and win-back
          campaigns. Actual results depend on your store, products, and audience.
        </p>
      </div>
    </section>
  );
}
