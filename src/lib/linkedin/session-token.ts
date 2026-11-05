/**
 * Passwordless session token. Cloned from frontierdesk `src/app/_lib/session.ts`:
 * HS256, issuer, audience, 30-day expiry. The cookie flags are applied by the route.
 */

import { SignJWT, jwtVerify } from "jose";
import { COMPANY } from "./company";

export const SESSION_COOKIE = COMPANY.sessionCookie;
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function authConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET);
}

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function mintSessionToken(
  email: string,
  secret: string,
  now = Date.now(),
): Promise<string> {
  const normalized = email.trim().toLowerCase();
  return new SignJWT({ email: normalized })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(normalized)
    .setIssuer(COMPANY.issuer)
    .setAudience(COMPANY.sessionAudience)
    .setIssuedAt(Math.floor(now / 1000))
    .setExpirationTime(Math.floor(now / 1000) + SESSION_MAX_AGE)
    .sign(key(secret));
}

export async function readSessionToken(
  token: string,
  secret: string,
): Promise<{ email: string; sub: string } | null> {
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      issuer: COMPANY.issuer,
      audience: COMPANY.sessionAudience,
    });
    const email = typeof payload.email === "string" ? payload.email : "";
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    if (!email) return null;
    return { email, sub };
  } catch {
    return null;
  }
}
