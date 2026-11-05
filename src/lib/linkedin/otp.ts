/**
 * Email OTP challenge. Cloned from frontierdesk `src/app/_lib/otp.ts`:
 * 6-digit code, HMAC in a 10-minute HS256 cookie, 5 attempts, 20s throttle.
 * The raw code is emailed. It is not stored.
 */

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { COMPANY } from "./company";

export const CHALLENGE_COOKIE = COMPANY.challengeCookie;
export const CHALLENGE_TTL_SECONDS = 10 * 60;
const MAX_ATTEMPTS = 5;
const THROTTLE_MS = 20 * 1000;

export type CookieStore = {
  get(name: string): string | undefined;
  set(name: string, value: string, maxAge: number): void;
};

function signingKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

function codeHash(secret: string, email: string, code: string): string {
  return createHmac("sha256", secret).update(`${email.trim().toLowerCase()}:${code}`).digest("hex");
}

function timingSafe(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

const lastSent = new Map<string, number>();

export function throttled(email: string, now = Date.now()): boolean {
  const key = email.trim().toLowerCase();
  const prev = lastSent.get(key);
  if (prev && now - prev < THROTTLE_MS) return true;
  lastSent.set(key, now);
  return false;
}

/** Test hook. The in-memory throttle is process-local, same as FD. */
export function resetThrottle(): void {
  lastSent.clear();
}

export async function createChallenge(
  email: string,
  code: string,
  secret: string,
  jar: CookieStore,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const token = await new SignJWT({
    email: normalized,
    ch: codeHash(secret, normalized, code),
    attempts: 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(COMPANY.issuer)
    .setAudience(COMPANY.otpAudience)
    .setIssuedAt()
    .setExpirationTime(`${CHALLENGE_TTL_SECONDS}s`)
    .sign(signingKey(secret));
  jar.set(CHALLENGE_COOKIE, token, CHALLENGE_TTL_SECONDS);
}

export type VerifyResult = "ok" | "invalid_code" | "no_challenge" | "too_many_attempts";

export async function verifyChallenge(
  email: string,
  code: string,
  secret: string,
  jar: CookieStore,
): Promise<VerifyResult> {
  const normalized = email.trim().toLowerCase();
  const token = jar.get(CHALLENGE_COOKIE);
  if (!token) return "no_challenge";

  let payload: Record<string, unknown>;
  try {
    const verified = await jwtVerify(token, signingKey(secret), {
      issuer: COMPANY.issuer,
      audience: COMPANY.otpAudience,
    });
    payload = verified.payload as Record<string, unknown>;
  } catch {
    jar.set(CHALLENGE_COOKIE, "", 0);
    return "no_challenge";
  }

  const challengeEmail = typeof payload.email === "string" ? payload.email : "";
  const storedHash = typeof payload.ch === "string" ? payload.ch : "";
  const attempts = typeof payload.attempts === "number" ? payload.attempts : 0;
  const exp = typeof payload.exp === "number" ? payload.exp : 0;

  if (challengeEmail !== normalized) return "invalid_code";
  if (attempts >= MAX_ATTEMPTS) {
    jar.set(CHALLENGE_COOKIE, "", 0);
    return "too_many_attempts";
  }
  if (storedHash.length > 0 && timingSafe(storedHash, codeHash(secret, normalized, code))) {
    jar.set(CHALLENGE_COOKIE, "", 0);
    return "ok";
  }

  const remaining = exp - Math.floor(Date.now() / 1000);
  if (remaining > 0) {
    const next = await new SignJWT({ email: normalized, ch: storedHash, attempts: attempts + 1 })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(COMPANY.issuer)
      .setAudience(COMPANY.otpAudience)
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(signingKey(secret));
    jar.set(CHALLENGE_COOKIE, next, remaining);
  }
  return "invalid_code";
}
