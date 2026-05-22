import { Orbit } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-display font-bold">
          <span className="grid place-items-center w-7 h-7 rounded-md bg-gradient-brand">
            <Orbit className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          Reorbit
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Reorbit. Built for Shopify merchants who refuse to stop growing.
        </div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground transition">Terms</Link>
          <Link to="/support" className="hover:text-foreground transition">Support</Link>
          <a href="mailto:hello@reorbit.dev" className="hover:text-foreground transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}
