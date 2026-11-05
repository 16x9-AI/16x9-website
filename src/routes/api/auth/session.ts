import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/linkedin/decide";
import { requestCookieStore } from "@/lib/linkedin/http-cookies";
import { readSessionToken, SESSION_COOKIE } from "@/lib/linkedin/session-token";
import { isTeamEmail } from "@/lib/linkedin/team";

export const Route = createFileRoute("/api/auth/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = requestCookieStore(request).get(SESSION_COOKIE);
        const session = token ? await readSessionToken(token, process.env.AUTH_SECRET || "") : null;
        if (!session) return json({ signedIn: false, team: false });
        return json({ signedIn: true, team: isTeamEmail(session.email) });
      },
    },
  },
});
