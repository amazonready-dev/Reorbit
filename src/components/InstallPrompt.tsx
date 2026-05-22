import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed?
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (installed) return;

    // Dismissed within last 7 days?
    const dismissedAt = localStorage.getItem("nova-install-dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIOS(ios);

    if (ios) {
      // iOS: show custom prompt after delay
      const t = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("nova-install-dismissed", String(Date.now()));
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setShow(false);
    } else {
      dismiss();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-safe pb-4 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface-elevated p-4 shadow-glow backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-bubble">
            <Download className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Install Nova on your phone</h3>
            {isIOS ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the{" "}
                <Share className="inline h-4 w-4 mb-0.5" />{" "}
                <span className="font-medium text-foreground">Share</span> button in
                Safari, then{" "}
                <span className="font-medium text-foreground">"Add to Home Screen"</span>.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Works offline, launches without the browser bar. No App Store needed.
              </p>
            )}
            {!isIOS && (
              <button
                onClick={install}
                className="mt-3 w-full rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform active:scale-95"
              >
                Install now
              </button>
            )}
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
