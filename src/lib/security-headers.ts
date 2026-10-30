// Security headers for every response.
//
// vercel.json headers are not applied to this app: TanStack Start deploys
// through Nitro's Build Output, and Nitro does not copy `headers` into
// `.vercel/output/config.json` (TanStack/router#4021). Nitro `routeRules`
// headers are emitted without `continue: true`, which stops routing before
// the function and the /intel rewrite. The Vite build appends a continuing
// header route instead. HTML from this server also sets the headers, plus a
// per-request nonce policy, because the edge route alone cannot name a nonce.

const NONCE_STORE = "__16x9Csp";

type NonceStore = { getStore: () => string | undefined };

// Consent-gated loaders in src/lib/analytics.ts, plus the /intel rewrite,
// which is a separate static deployment with an inline script and a Google
// Fonts @import. Vercel Web Analytics and Speed Insights post to same-origin
// /_vercel/* in production, so they add no third-party origin.
const SCRIPT_HOSTS = [
  "https://*.clarity.ms",
  "https://c.bing.com",
  "https://*.googletagmanager.com",
  "https://a.usbrowserspeed.com",
  "https://cdn.vector.co",
] as const;

const CONNECT_HOSTS = [
  "https://*.clarity.ms",
  "https://c.bing.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.googletagmanager.com",
  "https://*.g.doubleclick.net",
  "https://www.google.com",
  "https://a.usbrowserspeed.com",
  "https://api.vector.co",
] as const;

const IMG_HOSTS = [
  "https://*.clarity.ms",
  "https://c.bing.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.googletagmanager.com",
  "https://*.g.doubleclick.net",
  "https://www.google.com",
  "https://api.vector.co",
] as const;

export const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "browsing-topics=()",
  "camera=()",
  "display-capture=()",
  "geolocation=()",
  "gyroscope=()",
  "interest-cohort=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "screen-wake-lock=()",
  "usb=()",
].join(", ");

// Live apex and www already send this exact directive. includeSubDomains is
// omitted so a subdomain that is not on HTTPS is not pinned by this response.
export const STRICT_TRANSPORT_SECURITY = "max-age=63072000";

export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function installCspNonceStore(store: NonceStore) {
  (globalThis as unknown as Record<string, NonceStore>)[NONCE_STORE] = store;
}

export function readCspNonce(): string | undefined {
  if (typeof window !== "undefined") return undefined;
  const store = (globalThis as unknown as Record<string, NonceStore | undefined>)[NONCE_STORE];
  return store?.getStore();
}

export function requestIsHttps(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return new URL(request.url).protocol === "https:";
}

function policy(upgradeInsecureRequests: boolean, scriptSrc: string): string {
  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: ${IMG_HOSTS.join(" ")}`,
    `connect-src 'self' ${CONNECT_HOSTS.join(" ")}`,
    "frame-src 'self' https://api.vector.co",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];
  if (upgradeInsecureRequests) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

// Edge policy for every path, including the /intel rewrite and static files.
// 'unsafe-inline' is required: /intel ships an inline theme script and an
// inline stylesheet, and this header cannot carry a per-request nonce.
export function baselineContentSecurityPolicy(upgradeInsecureRequests: boolean): string {
  return policy(upgradeInsecureRequests, `'self' 'unsafe-inline' ${SCRIPT_HOSTS.join(" ")}`);
}

// Document policy for HTML this server renders. The nonce is stamped onto
// TanStack's inline bootstrap scripts. 'strict-dynamic' keeps consent-gated
// script injection working; 'unsafe-inline' is the fallback browsers ignore
// once a nonce is present. Sent in addition to the baseline policy.
export function documentContentSecurityPolicy(
  nonce: string,
  upgradeInsecureRequests: boolean,
): string {
  return policy(
    upgradeInsecureRequests,
    `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' ${SCRIPT_HOSTS.join(" ")}`,
  );
}

export function edgeSecurityHeaders(): Record<string, string> {
  return {
    "Strict-Transport-Security": STRICT_TRANSPORT_SECURITY,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": PERMISSIONS_POLICY,
    "Content-Security-Policy": baselineContentSecurityPolicy(true),
  };
}

export function applySecurityHeaders(
  response: Response,
  request: Request,
  nonce: string | undefined,
): Response {
  const headers = new Headers(response.headers);
  const upgrade = requestIsHttps(request);
  headers.set("Strict-Transport-Security", STRICT_TRANSPORT_SECURITY);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", PERMISSIONS_POLICY);
  headers.delete("Content-Security-Policy");
  headers.append("Content-Security-Policy", baselineContentSecurityPolicy(upgrade));
  const contentType = headers.get("content-type") ?? "";
  if (nonce && contentType.includes("text/html")) {
    headers.append("Content-Security-Policy", documentContentSecurityPolicy(nonce, upgrade));
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
