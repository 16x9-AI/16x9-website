import { createFileRoute } from "@tanstack/react-router";
import { handleDecide, notifyTeam } from "@/lib/linkedin/decide";
import { requestCookieStore } from "@/lib/linkedin/http-cookies";
import { mycelConfigured } from "@/lib/linkedin/company";
import { submitLinkedInPostPlan, writeTarget } from "@/lib/linkedin/mycel";
import { publishTargets } from "@/lib/linkedin/publisher";
import { currentImageVersion, getPagePost, readExistingTargets } from "@/lib/linkedin/queue";
import { readSessionToken, SESSION_COOKIE } from "@/lib/linkedin/session-token";
import { teamFixturesEnabled } from "@/lib/linkedin/fixtures";

export const Route = createFileRoute("/api/team/linkedin/decide")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handleDecide(request, {
          session: async () => {
            const token = requestCookieStore(request).get(SESSION_COOKIE);
            if (!token) return null;
            return readSessionToken(token, process.env.AUTH_SECRET || "");
          },
          getPost: getPagePost,
          submit: async (built) => {
            if (!mycelConfigured()) {
              return teamFixturesEnabled()
                ? { status: "received" as const }
                : { status: "not_configured" as const };
            }
            return submitLinkedInPostPlan(built.plan);
          },
          existingTargets: readExistingTargets,
          writeTarget: async (row) => {
            if (!mycelConfigured())
              return teamFixturesEnabled() ? { status: "received" } : { status: "not_configured" };
            return writeTarget(row);
          },
          publish: publishTargets,
          notify: notifyTeam,
          now: () => new Date().toISOString(),
          imageVersion: currentImageVersion,
        }),
    },
  },
});
