/**
 * Sign-in routes. Response shapes match Frontier Desk's OTP routes.
 * X9_OTP_DEV_ECHO=1 may return the code only when NODE_ENV is not production
 * and SES is unset, so a local review can finish without a mail account.
 */

import { sendOtpEmail } from "./email";
import { createChallenge, generateCode, throttled, verifyChallenge, type CookieStore } from "./otp";
import { authConfigured, mintSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "./session-token";
import { isTeamEmail } from "./team";
import { json } from "./decide";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function devEchoAllowed(): boolean {
  return process.env.X9_OTP_DEV_ECHO === "1" && process.env.NODE_ENV !== "production";
}

export async function handleOtpStart(request: Request, jar: CookieStore): Promise<Response> {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return json({ status: "error", detail: "invalid JSON" }, 400);
  }
  if (!EMAIL_RE.test(email)) return json({ status: "error", detail: "invalid email" }, 400);
  if (!authConfigured()) return json({ status: "not_configured" }, 503);
  if (throttled(email))
    return json({ status: "throttled", detail: "please wait before requesting another code" }, 429);

  const code = generateCode();
  await createChallenge(email, code, process.env.AUTH_SECRET || "", jar);
  const mail = await sendOtpEmail(email, code);
  const body: { status: "code_sent"; delivery: string; devCode?: string } = {
    status: "code_sent",
    delivery: mail.status,
  };
  if (devEchoAllowed() && mail.status === "not_configured") body.devCode = code;
  return json(body);
}

export async function handleOtpVerify(request: Request, jar: CookieStore): Promise<Response> {
  let email = "";
  let code = "";
  try {
    const body = (await request.json()) as { email?: unknown; code?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    code = typeof body.code === "string" ? body.code.trim() : "";
  } catch {
    return json({ status: "error", detail: "invalid JSON" }, 400);
  }
  if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) {
    return json({ status: "error", detail: "invalid email or code" }, 400);
  }
  if (!authConfigured()) return json({ status: "not_configured" }, 503);

  const result = await verifyChallenge(email, code, process.env.AUTH_SECRET || "", jar);
  if (result !== "ok") {
    const status = result === "too_many_attempts" ? 429 : 401;
    return json({ status: result }, status);
  }
  const token = await mintSessionToken(email, process.env.AUTH_SECRET || "");
  jar.set(SESSION_COOKIE, token, SESSION_MAX_AGE);
  return json({ status: "authenticated", team: isTeamEmail(email) });
}
