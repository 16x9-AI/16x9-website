import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import type { CookieStore } from "./otp";

export function cookieSecure(request: Request): boolean {
  if (process.env.X9_COOKIE_SECURE === "true") return true;
  if (process.env.X9_COOKIE_SECURE === "false") return false;
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}

/** HTTP-only, SameSite=Lax. Secure on https. The 30-day and 10-minute ages are set by the caller. */
export function requestCookieStore(request: Request): CookieStore {
  const secure = cookieSecure(request);
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
  return {
    get(name) {
      return getCookie(name);
    },
    set(name, value, maxAge) {
      if (!value || maxAge <= 0) deleteCookie(name, base);
      else setCookie(name, value, { ...base, maxAge });
    },
  };
}
