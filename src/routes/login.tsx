import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/team/LoginForm";
import { safeNext } from "@/lib/linkedin/next-url";

const SITE_ORIGIN = "https://16x9.ai";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    const next = typeof search.next === "string" ? search.next : "/team";
    return { next: safeNext(next, SITE_ORIGIN) };
  },
  head: () => ({
    meta: [{ title: "Sign in · 16x9" }, { name: "robots", content: "noindex, nofollow, nocache" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center bg-fog px-6 py-16 text-ink">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">16x9</p>
      <h1 className="mt-2 font-editorial text-4xl">Sign in</h1>
      <p className="mt-3 mb-8 text-sm text-ink/80">
        A code arrives by email. It expires in 10 minutes.
      </p>
      <LoginForm />
    </main>
  );
}
