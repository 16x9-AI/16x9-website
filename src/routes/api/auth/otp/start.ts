import { createFileRoute } from "@tanstack/react-router";
import { handleOtpStart } from "@/lib/linkedin/auth";
import { requestCookieStore } from "@/lib/linkedin/http-cookies";

export const Route = createFileRoute("/api/auth/otp/start")({
  server: {
    handlers: {
      POST: async ({ request }) => handleOtpStart(request, requestCookieStore(request)),
    },
  },
});
