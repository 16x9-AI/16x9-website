import { createFileRoute } from "@tanstack/react-router";
import { handleOtpVerify } from "@/lib/linkedin/auth";
import { requestCookieStore } from "@/lib/linkedin/http-cookies";

export const Route = createFileRoute("/api/auth/otp/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => handleOtpVerify(request, requestCookieStore(request)),
    },
  },
});
