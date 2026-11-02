export const ANALYTICS_CONFIG = {
  clarityId: "wlugn8zkb4",
  ga4Id: "G-6YXCQ374JR",
  identifyPid: "c6d3dd2bd73957a1b8e2b6cd7e91f275c9fe76abe2ccbb7d056d43e85542206a",
  identifyCid: "JgCMTv6Z",
} as const;

export const CONSENT_KEY = "cookie_consent_v1";
/** Fired on window to reopen the cookie banner (footer "Cookie preferences"). */
export const OPEN_CONSENT_EVENT = "x9:open-consent";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

/**
 * Global Privacy Control. California (CPRA) and several other states treat it as an opt-out of
 * "sale or sharing". The Identify.id pixel resolves visitor identity for marketing, so it never
 * loads when GPC is on, even after Accept. GA4 and Clarity measure the site and still follow the
 * banner choice.
 */
export function gpcOn(): boolean {
  return typeof navigator !== "undefined" && navigator.globalPrivacyControl === true;
}

function loadClarity(id: string) {
  if (!id || document.querySelector(`script[src*="clarity.ms/tag/${id}"]`)) return;
  const w = window as unknown as Record<string, unknown> & Window;
  w.clarity =
    w.clarity ||
    function (...args: unknown[]) {
      const fn = w.clarity as unknown as { q?: unknown[] };
      fn.q = fn.q || [];
      fn.q.push(args);
    };
  const t = document.createElement("script");
  t.async = true;
  t.src = "https://www.clarity.ms/tag/" + id;
  // Append to <head> rather than before "the first script": the SSR shell can have none, which
  // made the old snippet throw on Accept.
  document.head.appendChild(t);
  w.clarity("consent");
}

function gtagShim() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      // gtag.js only processes the `arguments` object; a plain array (rest params) is ignored,
      // which silently stops GA4 from sending anything. Keep this exactly as Google's snippet.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
}

function loadGA4(id: string) {
  if (!id) return;
  gtagShim();
  // Consent Mode v2: tell Google what was granted before the tag sends anything. Ads signals stay
  // denied: this site runs no ad campaigns through GA4.
  window.gtag?.("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.gtag?.("js", new Date());
  window.gtag?.("config", id, {
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

/**
 * Consent Mode v2 defaults, set on every page before any choice: everything denied. Nothing is
 * loaded here; it only records the default so a later Accept is an "update", as Google expects.
 */
export function consentDefaults() {
  if (typeof window === "undefined") return;
  gtagShim();
  window.gtag?.("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
}

export function activateAnalytics() {
  if (typeof window === "undefined") return;
  loadClarity(ANALYTICS_CONFIG.clarityId);
  loadGA4(ANALYTICS_CONFIG.ga4Id);
  if (!gpcOn()) loadIdentify(ANALYTICS_CONFIG.identifyPid, ANALYTICS_CONFIG.identifyCid);
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/**
 * One delegated listener for the events worth counting, so pages stay free of tracking code:
 *   generate_lead   any mailto link (the subject line says which door: owner, broker, ...)
 *   click           outbound links, with the host
 *   select_content  the industry filter and the "where the hours go" sentence
 * Events only send once GA4 has loaded, which only happens after Accept.
 */
export function installEventTracking() {
  if (typeof window === "undefined") return () => {};
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute("href") ?? "";
    if (href.startsWith("mailto:")) {
      const subject = new URLSearchParams(href.split("?")[1] ?? "").get("subject") ?? "general";
      trackEvent("generate_lead", { method: "email", door: subject, page: location.pathname });
      return;
    }
    if (/^https?:\/\//.test(href) && a.host !== location.host) {
      trackEvent("click", { outbound: true, link_domain: a.host, page: location.pathname });
    }
  };
  const onChange = (e: Event) => {
    const el = e.target as HTMLSelectElement | null;
    if (el?.tagName !== "SELECT") return;
    trackEvent("select_content", {
      content_type: el.closest("form")?.getAttribute("aria-label") ?? "filter",
      item_id: el.value,
      page: location.pathname,
    });
  };
  document.addEventListener("click", onClick, { capture: true });
  document.addEventListener("change", onChange, { capture: true });
  return () => {
    document.removeEventListener("click", onClick, { capture: true });
    document.removeEventListener("change", onChange, { capture: true });
  };
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
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
