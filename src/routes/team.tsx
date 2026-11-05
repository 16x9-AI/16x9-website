import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { PagePostsPanel } from "@/components/team/PagePostsPanel";
import { getReviewQueue } from "@/lib/linkedin/queue";
import { readSessionToken, SESSION_COOKIE } from "@/lib/linkedin/session-token";
import { isTeamEmail } from "@/lib/linkedin/team";

const loadTeam = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(SESSION_COOKIE);
  const session = token ? await readSessionToken(token, process.env.AUTH_SECRET || "") : null;
  if (!session) return { kind: "anonymous" as const };
  if (!isTeamEmail(session.email)) return { kind: "denied" as const, email: session.email };
  const queue = await getReviewQueue();
  return { kind: "team" as const, email: session.email, ...queue };
});

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [{ title: "Team · 16x9" }, { name: "robots", content: "noindex, nofollow, nocache" }],
  }),
  loader: async () => {
    const data = await loadTeam();
    if (data.kind === "anonymous") {
      throw redirect({ to: "/login", search: { next: "/team", error: undefined } });
    }
    return data;
  },
  component: TeamPage,
});

function TeamPage() {
  const data = Route.useLoaderData();
  if (data.kind !== "team") {
    return (
      <main className="mx-auto min-h-screen max-w-3xl bg-fog px-6 py-16 text-ink">
        <h1 className="font-editorial text-4xl">This page is for the 16x9 team.</h1>
        <p className="mt-4 text-sm text-ink/80">
          You’re signed in as {data.kind === "denied" ? data.email : "someone else"}.
        </p>
      </main>
    );
  }
  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-fog px-6 py-10 text-ink">
      <header className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">16x9</p>
          <h1 className="font-editorial text-4xl">Team</h1>
        </div>
        <button
          type="button"
          className="text-[13px] text-ink/80 underline underline-offset-4"
          onClick={() => {
            void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
              window.location.assign("/login");
            });
          }}
        >
          Sign out
        </button>
      </header>
      <PagePostsPanel drafted={data.drafted} decided={data.decided} />
    </main>
  );
}
