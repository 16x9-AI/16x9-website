import { createFileRoute } from "@tanstack/react-router";
import { handleGoogleCallback } from "@/lib/linkedin/google";
import { requestCookieStore } from "@/lib/linkedin/http-cookies";

export const Route = createFileRoute("/api/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => handleGoogleCallback(request, requestCookieStore(request)),
    },
  },
});
