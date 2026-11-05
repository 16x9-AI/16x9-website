import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/linkedin/decide";
import { requestCookieStore } from "@/lib/linkedin/http-cookies";
import { SESSION_COOKIE } from "@/lib/linkedin/session-token";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        requestCookieStore(request).set(SESSION_COOKIE, "", 0);
        return json({ status: "signed_out" });
      },
    },
  },
});
