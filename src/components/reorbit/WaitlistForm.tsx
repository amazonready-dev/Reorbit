import { useState, FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { joinWaitlist } from "@/lib/waitlist.functions";
import { Loader2, Check, Rocket } from "lucide-react";

export function WaitlistForm() {
  const submit = useServerFn(joinWaitlist);
  const [email, setEmail] = useState("");
  const [store, setStore] = useState("");
  const [orders, setOrders] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ position: number | null; already: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await submit({
        data: {
          email,
          shopify_store: store || null,
          monthly_orders: orders || null,
          referrer: typeof document !== "undefined" ? document.referrer : null,
        },
      });
      setDone({ position: res.position ?? null, already: res.alreadyJoined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="waitlist" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-3xl px-6">
        <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-br from-surface-elevated to-surface border border-border overflow-hidden">
          {/* glow */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-accent/20 blur-3xl rounded-full" />

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-xs text-accent mb-6">
              <Rocket className="w-3.5 h-3.5" /> Beta launching Q3 · Limited spots
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Be first <span className="text-gradient-brand">in orbit.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join the waitlist. Early access members get <strong>50% off forever</strong>,
              priority onboarding, and a direct line to the founders.
            </p>

            {done ? (
              <div className="relative mt-10 max-w-md mx-auto p-6 rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                <Check className="w-8 h-8 mx-auto mb-2" />
                <div className="font-display font-bold text-xl">
                  {done.already ? "You're already in!" : "You're on the list 🎉"}
                </div>
                {done.position && (
                  <div className="text-sm opacity-90 mt-1">
                    Position #{done.position} · We'll email you when it's your turn.
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={onSubmit} className="relative mt-10 space-y-3 max-w-md mx-auto text-left">
                <input
                  required
                  type="email"
                  placeholder="you@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                />
                <input
                  type="text"
                  placeholder="Your Shopify store (optional, e.g. mystore.myshopify.com)"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                />
                <select
                  value={orders}
                  onChange={(e) => setOrders(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition text-muted-foreground"
                >
                  <option value="">Monthly order volume (optional)</option>
                  <option value="<100">Under 100</option>
                  <option value="100-500">100 – 500</option>
                  <option value="500-2000">500 – 2,000</option>
                  <option value="2000-10000">2,000 – 10,000</option>
                  <option value="10000+">10,000+</option>
                </select>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-5 py-3.5 rounded-xl bg-gradient-brand text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Joining…
                    </>
                  ) : (
                    "Get early access"
                  )}
                </button>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  We'll never share your email. Unsubscribe any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
