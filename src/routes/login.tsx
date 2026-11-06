import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { LoginForm } from "@/components/team/LoginForm";
import { safeNext } from "@/lib/linkedin/next-url";
import { readSessionToken, SESSION_COOKIE } from "@/lib/linkedin/session-token";
import { isTeamEmail } from "@/lib/linkedin/team";

const SITE_ORIGIN = "https://16x9.ai";
const ERRORS = ["denied", "invalid", "not_configured"] as const;

const loadLogin = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(SESSION_COOKIE);
  const session = token ? await readSessionToken(token, process.env.AUTH_SECRET || "") : null;
  return { team: Boolean(session && isTeamEmail(session.email)) };
});

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    const next = typeof search.next === "string" ? search.next : "/team";
    const error = ERRORS.find((item) => item === search.error);
    return { next: safeNext(next, SITE_ORIGIN), error };
  },
  head: () => ({
    meta: [{ title: "Sign in · 16x9" }, { name: "robots", content: "noindex, nofollow, nocache" }],
  }),
  loader: async ({ location }) => {
    const data = await loadLogin();
    if (data.team) {
      const raw = location.search as { next?: unknown };
      const next =
        typeof raw.next === "string" && !raw.next.startsWith("/login") ? raw.next : "/team";
      throw redirect({ href: next });
    }
    return data;
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-6 py-16 text-ink md:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">16x9 / Team</p>
      <h1 className="mt-4 max-w-[10ch] font-editorial text-[clamp(3rem,7vw,5.5rem)] uppercase leading-[0.9] tracking-tight">
        Sign in
      </h1>
      <p className="mt-6 max-w-[42ch] text-[16px] leading-[1.6]">
        Use the Google account on the admin list.
      </p>
      <LoginForm />
    </main>
  );
}
