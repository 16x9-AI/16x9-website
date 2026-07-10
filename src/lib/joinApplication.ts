import { createServerFn } from "@tanstack/react-start";

// "Join the Frame" application intake.
//
// Sends the three field answers + name + email to info@16x9.ai via Resend
// (https://resend.com). Requires RESEND_API_KEY to be set in the server
// environment (see README / repo CLAUDE.md for setup). If the key is
// missing, this fails soft with a `not_configured` result instead of
// throwing, so the form keeps rendering and validating before Nelson wires
// up the key.
//
// TODO(rate limiting): this is stateless per-isolate, so there's no
// meaningful in-memory limiter here (Cloudflare Workers isolates aren't
// long-lived / aren't shared across edge locations). If abuse becomes a
// problem, add a Cloudflare Rate Limiting rule on this route, or a
// Durable Object / KV-backed counter keyed on IP.

const RECIPIENT = "info@16x9.ai";
const FROM = "16x9 Join Form <apply@16x9.ai>"; // must be a verified sender/domain in Resend
const MAX_SHORT = 200;
const MAX_LONG = 4000;

export type JoinApplicationInput = {
  name: string;
  email: string;
  field01: string;
  field02: string;
  field03: string;
  // honeypot - must stay empty. Real users never see or fill this field.
  company: string;
};

export type JoinApplicationResult =
  | { ok: true }
  | { ok: false; error: "validation"; message: string }
  | { ok: false; error: "not_configured" }
  | { ok: false; error: "send_failed" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const submitJoinApplication = createServerFn({ method: "POST" })
  .inputValidator((data: JoinApplicationInput) => data)
  .handler(async ({ data }): Promise<JoinApplicationResult> => {
    const name = clean(data?.name);
    const email = clean(data?.email);
    const field01 = clean(data?.field01);
    const field02 = clean(data?.field02);
    const field03 = clean(data?.field03);
    const company = clean(data?.company);

    // Honeypot: bots fill every field, humans never see this one.
    if (company !== "") {
      return { ok: false, error: "validation", message: "Invalid submission." };
    }

    if (!name || !email || !field01 || !field02 || !field03) {
      return { ok: false, error: "validation", message: "All fields are required." };
    }
    if (!EMAIL_RE.test(email)) {
      return { ok: false, error: "validation", message: "Enter a valid email." };
    }
    if (
      name.length > MAX_SHORT ||
      email.length > MAX_SHORT ||
      field01.length > MAX_LONG ||
      field02.length > MAX_LONG ||
      field03.length > MAX_LONG
    ) {
      return { ok: false, error: "validation", message: "One of the fields is too long." };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("submitJoinApplication: RESEND_API_KEY is not set, refusing to send.");
      return { ok: false, error: "not_configured" };
    }

    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Field 01 - Describe a synthesis you've made across two unrelated fields.",
      field01,
      "",
      "Field 02 - Tell us about something you built that nobody asked for.",
      field02,
      "",
      "Field 03 - What did you teach yourself last year, and what did it replace?",
      field03,
    ].join("\n");

    const html = `<pre style="font-family: ui-monospace, monospace; white-space: pre-wrap;">${escapeHtml(text)}</pre>`;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to: [RECIPIENT],
          reply_to: email,
          subject: `Join the Frame — ${name}`,
          text,
          html,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(`submitJoinApplication: Resend returned ${response.status}: ${body}`);
        return { ok: false, error: "send_failed" };
      }

      return { ok: true };
    } catch (err) {
      console.error("submitJoinApplication: Resend request failed", err);
      return { ok: false, error: "send_failed" };
    }
  });
