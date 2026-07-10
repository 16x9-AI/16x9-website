export const ANALYTICS_CONFIG = {
  clarityId: "wlugn8zkb4",
  ga4Id: "G-6YXCQ374JR",
  identifyPid: "c6d3dd2bd73957a1b8e2b6cd7e91f275c9fe76abe2ccbb7d056d43e85542206a",
  identifyCid: "JgCMTv6Z",
} as const;

export const CONSENT_KEY = "cookie_consent_v1";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadClarity(id: string) {
  if (!id || document.querySelector(`script[src*="clarity.ms/tag/${id}"]`)) return;
  (function (c: Window, l: Document, a: string, r: string, i: string) {
    (c as unknown as Record<string, unknown>)[a] =
      (c as unknown as Record<string, (...args: unknown[]) => void>)[a] ||
      function (...args: unknown[]) {
        const fn = (c as unknown as Record<string, { q?: unknown[] }>)[a];
        fn.q = fn.q || [];
        fn.q.push(args);
      };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window, document, "clarity", "script", id);
}

function loadGA4(id: string) {
  if (!id) return;

  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, {
    anonymize_ip: true,
    cookie_flags: "SameSite=None;Secure",
  });
}

function loadIdentify(pid: string, cid: string) {
  if (!pid || !cid || document.querySelector(`script[src*="usbrowserspeed.com/cs?pid=${pid}"]`))
    return;
  const scr = document.createElement("script");
  scr.type = "text/javascript";
  scr.src =
    "https://a.usbrowserspeed.com/cs?pid=" +
    pid +
    "&puid=" +
    encodeURIComponent(
      JSON.stringify({
        visited: window.location.href,
        client: "identify",
        cid: cid,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "web",
      }),
    );
  document.head.appendChild(scr);
}

export function activateAnalytics() {
  if (typeof window === "undefined") return;
  loadClarity(ANALYTICS_CONFIG.clarityId);
  loadGA4(ANALYTICS_CONFIG.ga4Id);
  loadIdentify(ANALYTICS_CONFIG.identifyPid, ANALYTICS_CONFIG.identifyCid);
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export function getConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: "accepted" | "rejected") {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* ignore */
  }
}
