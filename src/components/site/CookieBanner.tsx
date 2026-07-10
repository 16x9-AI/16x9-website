import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { activateAnalytics, getConsent, setConsent } from "@/lib/analytics";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (existing === "accepted") {
      activateAnalytics();
      return;
    }
    if (existing === "rejected") return;
    const t = window.setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    }, 800);
    return () => window.clearTimeout(t);
  }, []);

  const accept = () => {
    setConsent("accepted");
    setVisible(false);
    window.setTimeout(() => setMounted(false), 400);
    activateAnalytics();
  };

  const reject = () => {
    setConsent("rejected");
    setVisible(false);
    window.setTimeout(() => setMounted(false), 400);
  };

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className={`fixed inset-x-4 bottom-8 z-[60] mx-auto max-w-3xl border border-ink/80 bg-background p-5 transition-all duration-300 md:bottom-10 md:p-6 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <p className="font-mono text-[12px] uppercase leading-relaxed tracking-[0.04em] text-graphite md:flex-1">
          This site uses cookies to understand how the site is used.{" "}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-ink">
            Read the privacy policy
          </Link>
          .
        </p>
        <div className="flex gap-2 md:shrink-0">
          <button
            onClick={reject}
            className="inline-flex h-10 items-center border border-ink/80 bg-background px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink hover:bg-ui-hover"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="inline-flex h-10 items-center border border-ink bg-ink px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-background hover:bg-graphite"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
