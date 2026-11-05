/**
 * Google sign-in for /login and /team.
 * Authorization code + PKCE. The ID token is checked against Google's keys,
 * then the email must be on the admin allowlist. The session cookie is the
 * same AUTH_SECRET HS256 cookie as before.
 *
 * Production redirect URI to register:
 * https://16x9.ai/api/auth/google/callback
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { COMPANY } from "./company";
import type { CookieStore } from "./otp";
import { safeNext } from "./next-url";
import { mintSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "./session-token";
import { isTeamEmail } from "./team";

const STATE_TTL_SECONDS = 10 * 60;
const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_CERTS = "https://www.googleapis.com/oauth2/v3/certs";

export type GoogleIdentity = { email: string; nonce: string };

export type GoogleExchangeInput = {
  code: string;
  verifier: string;
  redirectUri: string;
};

export type GoogleDeps = {
  exchange(input: GoogleExchangeInput): Promise<string | null>;
  verify(idToken: string, check: { nonce: string }): Promise<GoogleIdentity | null>;
};

export function googleConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

/** Public origin. Prefers the proxy headers Vercel sets, so the redirect URI matches the registered host. */
export function requestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host && forwardedProto && /^https?$/.test(forwardedProto)) {
    return `${forwardedProto}://${host}`;
  }
  const url = new URL(request.url);
  if (host) return `${url.protocol}//${host}`;
  return url.origin;
}

export function googleRedirectUri(request: Request): string {
  return `${requestOrigin(request)}/api/auth/google/callback`;
}

function signingKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

function base64url(bytes: Buffer): string {
  return bytes.toString("base64url");
}

function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store" },
  });
}

function loginError(error: "denied" | "invalid" | "not_configured"): string {
  return `/login?error=${error}`;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function googleCerts() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(GOOGLE_CERTS));
  return jwks;
}

export async function exchangeGoogleCode(input: GoogleExchangeInput): Promise<string | null> {
  const response = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams({
      code: input.code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: input.redirectUri,
      grant_type: "authorization_code",
      code_verifier: input.verifier,
    }),
  });
  if (!response.ok) return null;
  const body = (await response.json().catch(() => null)) as { id_token?: unknown } | null;
  return body && typeof body.id_token === "string" ? body.id_token : null;
}

export async function verifyGoogleIdToken(
  idToken: string,
  check: { nonce: string },
): Promise<GoogleIdentity | null> {
  const audience = process.env.GOOGLE_CLIENT_ID || "";
  if (!audience) return null;
  const { payload } = await jwtVerify(idToken, googleCerts(), {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience,
  });
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const nonce = typeof payload.nonce === "string" ? payload.nonce : "";
  const flag = payload.email_verified;
  const verified = flag === true || flag === "true";
  if (!email || !nonce || !verified || !same(nonce, check.nonce)) return null;
  return { email, nonce };
}

export async function handleGoogleStart(request: Request, jar: CookieStore): Promise<Response> {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next") || "/team", requestOrigin(request));
  if (!googleConfigured())
    return redirect(`${loginError("not_configured")}&next=${encodeURIComponent(next)}`);

  const state = base64url(randomBytes(16));
  const nonce = base64url(randomBytes(16));
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const token = await new SignJWT({ st: state, no: nonce, vf: verifier, nx: next })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(COMPANY.issuer)
    .setAudience(COMPANY.googleAudience)
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SECONDS}s`)
    .sign(signingKey(process.env.AUTH_SECRET || ""));
  jar.set(COMPANY.googleStateCookie, token, STATE_TTL_SECONDS);

  const auth = new URL(GOOGLE_AUTH);
  auth.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  auth.searchParams.set("redirect_uri", googleRedirectUri(request));
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("nonce", nonce);
  auth.searchParams.set("code_challenge", challenge);
  auth.searchParams.set("code_challenge_method", "S256");
  auth.searchParams.set("prompt", "select_account");
  return redirect(auth.toString());
}

export async function handleGoogleCallback(
  request: Request,
  jar: CookieStore,
  deps: Partial<GoogleDeps> = {},
): Promise<Response> {
  const exchange = deps.exchange ?? exchangeGoogleCode;
  const verify = deps.verify ?? verifyGoogleIdToken;
  const fail = (error: "denied" | "invalid" | "not_configured") => {
    jar.set(COMPANY.googleStateCookie, "", 0);
    return redirect(loginError(error));
  };

  if (!googleConfigured()) return fail("not_configured");

  const url = new URL(request.url);
  if (url.searchParams.get("error")) return fail("denied");
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const cookie = jar.get(COMPANY.googleStateCookie);
  if (!code || !state || !cookie) return fail("invalid");

  let payload: Record<string, unknown>;
  try {
    const verified = await jwtVerify(cookie, signingKey(process.env.AUTH_SECRET || ""), {
      issuer: COMPANY.issuer,
      audience: COMPANY.googleAudience,
    });
    payload = verified.payload as Record<string, unknown>;
  } catch {
    return fail("invalid");
  }

  const storedState = typeof payload.st === "string" ? payload.st : "";
  const nonce = typeof payload.no === "string" ? payload.no : "";
  const verifier = typeof payload.vf === "string" ? payload.vf : "";
  const next = safeNext(
    typeof payload.nx === "string" ? payload.nx : "/team",
    requestOrigin(request),
  );
  if (!storedState || !nonce || !verifier || !same(storedState, state)) return fail("invalid");

  let idToken: string | null;
  try {
    idToken = await exchange({ code, verifier, redirectUri: googleRedirectUri(request) });
  } catch {
    idToken = null;
  }
  if (!idToken) return fail("invalid");

  let identity: GoogleIdentity | null;
  try {
    identity = await verify(idToken, { nonce });
  } catch {
    identity = null;
  }
  if (!identity || !identity.email || !same(identity.nonce, nonce)) return fail("invalid");
  if (!isTeamEmail(identity.email)) return fail("denied");

  const session = await mintSessionToken(identity.email, process.env.AUTH_SECRET || "");
  jar.set(COMPANY.googleStateCookie, "", 0);
  jar.set(SESSION_COOKIE, session, SESSION_MAX_AGE);
  return redirect(next);
}
