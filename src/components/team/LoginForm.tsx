import { getRouteApi } from "@tanstack/react-router";

const loginRoute = getRouteApi("/login");

const messages = {
  denied: "That Google account cannot sign in.",
  invalid: "Sign-in did not finish. Try again.",
  not_configured: "Sign-in is not set up on this server.",
} as const;

export function LoginForm() {
  const search = loginRoute.useSearch();
  const href = `/api/auth/google/start?next=${encodeURIComponent(search.next)}`;
  const message = search.error ? messages[search.error] : "";

  return (
    <div className="mt-8">
      {message ? (
        <p className="mb-4 max-w-sm text-[14px] text-destructive" role="alert">
          {message}
        </p>
      ) : null}
      <a
        href={href}
        className="inline-flex h-11 items-center bg-ink px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-snow transition-colors hover:bg-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Sign in with Google
      </a>
    </div>
  );
}
