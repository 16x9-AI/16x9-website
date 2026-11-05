/**
 * Email OTP challenge. Cloned from frontierdesk `src/app/_lib/otp.ts`:
 * 6-digit code, HMAC in a 10-minute HS256 cookie, 5 attempts, 20s throttle.
 * The raw code is emailed. It is not stored.
 *
 * FD keeps `attempts` only inside that cookie and re-signs it after a miss.
 * Replaying the first cookie resets the count. The ledger below is the
 * server-side count for the same challenge (email + code hash). An older
 * cookie cannot lower it. The ledger is process-local, same limit as FD's
 * send throttle.
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
const attemptLedger = new Map<string, { count: number; expMs: number }>();
const emailTotals = new Map<string, { count: number; expMs: number }>();
const sendHits = new Map<string, number[]>();

const SEND_WINDOW_MS = 10 * 60 * 1000;
const SEND_PER_IP = 8;
const SEND_GLOBAL = 30;

function ledgerKey(email: string, hash: string): string {
  return `${email}\n${hash}`;
}

function rememberedAttempts(email: string, hash: string, now = Date.now()): number {
  if (!hash) return 0;
  const row = attemptLedger.get(ledgerKey(email, hash));
  if (!row) return 0;
  if (row.expMs <= now) {
    attemptLedger.delete(ledgerKey(email, hash));
    return 0;
  }
  return row.count;
}

function rememberAttempts(email: string, hash: string, count: number, expSeconds: number): void {
  if (!hash) return;
  const key = ledgerKey(email, hash);
  const prev = attemptLedger.get(key);
  attemptLedger.set(key, {
    count: Math.max(prev?.count ?? 0, count),
    expMs: Math.max(prev?.expMs ?? 0, expSeconds * 1000),
  });
}

function emailAttemptCount(email: string, now = Date.now()): number {
  const row = emailTotals.get(email);
  if (!row) return 0;
  if (row.expMs <= now) {
    emailTotals.delete(email);
    return 0;
  }
  return row.count;
}

function noteEmailAttempts(email: string, count: number, expSeconds: number): void {
  const prev = emailTotals.get(email);
  emailTotals.set(email, {
    count: Math.max(prev?.count ?? 0, count),
    expMs: Math.max(prev?.expMs ?? 0, expSeconds * 1000),
  });
}

/** True when this IP or the process is over the send cap. Records the attempt when it is allowed. */
export function sendBudgetExceeded(ip: string, now = Date.now()): boolean {
  const within = (stamps: number[]) => stamps.filter((t) => now - t < SEND_WINDOW_MS);
  const global = within(sendHits.get("*") ?? []);
  const mine = within(sendHits.get(ip) ?? []);
  if (global.length >= SEND_GLOBAL || mine.length >= SEND_PER_IP) {
    sendHits.set("*", global);
    sendHits.set(ip, mine);
    return true;
  }
  global.push(now);
  mine.push(now);
  sendHits.set("*", global);
  sendHits.set(ip, mine);
  return false;
}

export function throttled(email: string, now = Date.now()): boolean {
  const key = email.trim().toLowerCase();
  const prev = lastSent.get(key);
  if (prev && now - prev < THROTTLE_MS) return true;
  lastSent.set(key, now);
  return false;
}

/** Test hook. The in-memory throttle and attempt ledger are process-local. */
export function resetThrottle(): void {
  lastSent.clear();
  attemptLedger.clear();
  emailTotals.clear();
  sendHits.clear();
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
  const cookieAttempts = typeof payload.attempts === "number" ? payload.attempts : 0;
  const attempts = Math.max(
    cookieAttempts,
    rememberedAttempts(normalized, storedHash),
    emailAttemptCount(normalized),
  );
  const exp = typeof payload.exp === "number" ? payload.exp : 0;

  if (challengeEmail !== normalized) return "invalid_code";
  if (attempts >= MAX_ATTEMPTS) {
    rememberAttempts(normalized, storedHash, attempts, exp);
    noteEmailAttempts(normalized, attempts, exp);
    jar.set(CHALLENGE_COOKIE, "", 0);
    return "too_many_attempts";
  }
  if (storedHash.length > 0 && timingSafe(storedHash, codeHash(secret, normalized, code))) {
    rememberAttempts(normalized, storedHash, MAX_ATTEMPTS, exp);
    jar.set(CHALLENGE_COOKIE, "", 0);
    return "ok";
  }

  const remaining = exp - Math.floor(Date.now() / 1000);
  const nextCount = attempts + 1;
  rememberAttempts(normalized, storedHash, nextCount, exp);
  noteEmailAttempts(normalized, nextCount, exp);
  if (remaining > 0) {
    const next = await new SignJWT({ email: normalized, ch: storedHash, attempts: nextCount })
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
