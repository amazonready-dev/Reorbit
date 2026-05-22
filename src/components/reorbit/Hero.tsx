import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-20 pb-32">
      {/* Orbit rings background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="absolute w-[600px] h-[600px] rounded-full border border-primary/20 animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[900px] h-[900px] rounded-full border border-accent/15 animate-[spin_90s_linear_infinite_reverse]" />
        <div className="absolute w-[1200px] h-[1200px] rounded-full border border-primary/10 animate-[spin_120s_linear_infinite]" />
        <div className="absolute w-72 h-72 rounded-full bg-gradient-brand blur-3xl opacity-40" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/50 backdrop-blur text-xs text-muted-foreground mb-8">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          Built for Shopify · Powered by AI
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          Turn one-time buyers <br />
          into <span className="text-gradient-brand">repeat revenue.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Reorbit is an AI engine for Shopify that automatically sends personalized
          post-purchase upsells and win-back campaigns — based on each customer's
          actual behavior. No copywriting. No flows to build. Just revenue.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#waitlist"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-brand text-primary-foreground font-semibold shadow-glow hover:scale-[1.03] transition"
          >
            Join the waitlist
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </a>
          <a
            href="#how"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border text-foreground hover:bg-surface transition"
          >
            See how it works
          </a>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Free during beta · 14-day free trial after launch · No credit card
        </p>
      </div>

      {/* Stats strip */}
      <div className="relative mt-20 mx-auto max-w-4xl px-6 grid grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
        {[
          { v: "+34%", l: "avg. repeat purchase rate" },
          { v: "8.2×", l: "ROI vs. send cost" },
          { v: "< 5 min", l: "from install to live" },
        ].map((s) => (
          <div key={s.l} className="bg-surface px-6 py-6 text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-gradient-brand">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
