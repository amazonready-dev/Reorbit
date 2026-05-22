import { Orbit } from "lucide-react";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-brand shadow-glow">
            <Orbit className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </span>
          Reorbit
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#roi" className="hover:text-foreground transition">ROI</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
        </nav>
        <a
          href="#waitlist"
          className="text-sm px-4 py-2 rounded-full bg-gradient-brand text-primary-foreground font-medium shadow-glow hover:scale-[1.03] transition"
        >
          Join waitlist
        </a>
      </div>
    </header>
  );
}
