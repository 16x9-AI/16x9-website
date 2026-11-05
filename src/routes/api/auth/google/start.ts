import { createFileRoute } from "@tanstack/react-router";
import { handleGoogleStart } from "@/lib/linkedin/google";
import { requestCookieStore } from "@/lib/linkedin/http-cookies";

export const Route = createFileRoute("/api/auth/google/start")({
  server: {
    handlers: {
      GET: async ({ request }) => handleGoogleStart(request, requestCookieStore(request)),
    },
  },
});
