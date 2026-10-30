import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { getConsent, subscribeConsent } from "@/lib/analytics";

// Same consent gate as GA4, Clarity, and the Identify pixel. Both packages
// are cookieless, and the privacy policy only allows analytics after consent.
export function VercelInsights() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (getConsent() === "accepted") setEnabled(true);
    return subscribeConsent((value) => {
      if (value === "accepted") setEnabled(true);
    });
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
