import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  OPEN_CONSENT_EVENT,
  activateAnalytics,
  consentDefaults,
  getConsent,
  installEventTracking,
  setConsent,
} from "@/lib/analytics";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const show = () => {
    setMounted(true);
    requestAnimationFrame(() => setVisible(true));
  };
  const hide = () => {
    setVisible(false);
    window.setTimeout(() => setMounted(false), 400);
  };

  useEffect(() => {
    consentDefaults();
    const stopTracking = installEventTracking();
    // The footer's "Cookie preferences" reopens this banner at any time (the privacy policy
    // promises that control).
    window.addEventListener(OPEN_CONSENT_EVENT, show);

    const existing = getConsent();
    let t: number | undefined;
    if (existing === "accepted") activateAnalytics();
    else if (existing !== "rejected") t = window.setTimeout(show, 800);

    return () => {
      stopTracking();
      window.removeEventListener(OPEN_CONSENT_EVENT, show);
      if (t) window.clearTimeout(t);
    };
  }, []);

  const accept = () => {
    setConsent("accepted");
    hide();
    activateAnalytics();
  };

  const reject = () => {
    const wasAccepted = getConsent() === "accepted";
    setConsent("rejected");
    hide();
    // Tags already on the page cannot be unloaded. Withdraw consent with Google and Clarity, then
    // reload so nothing keeps running for the rest of the visit.
    if (wasAccepted) {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      window.clarity?.("consent", false);
      window.setTimeout(() => window.location.reload(), 450);
    }
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
            className="inline-flex h-11 items-center border border-ink/80 bg-background px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink hover:bg-ui-hover"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="inline-flex h-11 items-center border border-ink bg-ink px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-background hover:bg-graphite"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
