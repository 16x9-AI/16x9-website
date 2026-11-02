import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

// The homepage advisor (RELAY): the browser sends the conversation here; this server function
// forwards it to the Mycel agent `x9_site_advisor` in 16x9's own deal universe and returns the
// reply. The Mycel key never reaches the browser.
//
// Agent source of truth: companies/16x9/Engineering/advisor/ in the Brain vault (prompt,
// knowledge base generated from this repo's data files, go-live test script).
//
// Call shape (same seam as 16x9-AI/industry-daily-report src/mycel.ts):
//   POST {MYCEL_API_BASE}/api/sdk/agents/x9_site_advisor/run/stream  -> read the run id, stop
//   GET  {MYCEL_API_BASE}/api/sdk/runs/{id}                            -> poll until finished
// CloudFront cuts a held connection at ~60 s, so the relay never holds one.
// Unlike that repo there is NO "latest run" fallback: with many visitors at once it could hand
// one visitor another visitor's reply. No run id means a safe failure.
//
// Guardrails here (the agent carries its own in its prompt):
//   - inert until MYCEL_API_BASE and MYCEL_16X9_API_KEY are set: returns "offline"
//   - 12 turns, 800 characters per visitor message, control characters stripped
//   - 8 messages per visitor per 10 minutes, and a daily cap, per server instance (best effort;
//     a shared store is the upgrade if traffic grows)
//   - nothing stored or logged: the conversation lives in the visitor's browser only
//
// Env: MYCEL_API_BASE, MYCEL_16X9_API_KEY, MYCEL_16X9_ECOSYSTEM_ID (default: 16x9 universe),
//      ADVISOR_DAILY_CAP (default 400)

const ECO = process.env.MYCEL_16X9_ECOSYSTEM_ID || "318b5ffd-6706-492f-912b-37ed4bc28a55";
const AGENT = "x9_site_advisor";
const MAX_TURNS = 12;
const MAX_CHARS = 800;
const WINDOW_MS = 10 * 60 * 1000;
const PER_WINDOW = 8;
const POLL_MS = 1000;
const DEADLINE_MS = 25_000;

export type Turn = { role: "visitor" | "advisor"; text: string };
export type AdvisorReply =
  { ok: true; text: string } | { ok: false; reason: "offline" | "busy" | "invalid" | "error" };

const hits = new Map<string, number[]>();
let day = "";
let dayCount = 0;

function clean(s: string, max: number) {
  // Drop control characters except tab, newline and carriage return.
  const kept = Array.from(s)
    .filter((ch) => {
      const c = ch.charCodeAt(0);
      return c === 9 || c === 10 || c === 13 || (c >= 32 && c !== 127);
    })
    .join("");
  return kept.trim().slice(0, max);
}

export function validate(input: unknown): Turn[] | null {
  if (!input || typeof input !== "object" || !Array.isArray((input as { turns?: unknown }).turns))
    return null;
  const turns = (input as { turns: unknown[] }).turns.slice(-MAX_TURNS);
  const out: Turn[] = [];
  for (const t of turns) {
    if (!t || typeof t !== "object") return null;
    const { role, text } = t as Record<string, unknown>;
    if ((role !== "visitor" && role !== "advisor") || typeof text !== "string") return null;
    const c = clean(text, role === "visitor" ? MAX_CHARS : 2000);
    if (c) out.push({ role, text: c });
  }
  if (!out.length || out[out.length - 1].role !== "visitor") return null;
  return out;
}

function allowed(visitor: string, now = Date.now()): boolean {
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    dayCount = 0;
  }
  const cap = Number(process.env.ADVISOR_DAILY_CAP) || 400;
  if (dayCount >= cap) return false;
  const recent = (hits.get(visitor) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_WINDOW) {
    hits.set(visitor, recent);
    return false;
  }
  recent.push(now);
  hits.set(visitor, recent);
  dayCount++;
  return true;
}

/** The final reply text in a finished run, wherever the platform puts it. */
export function replyText(detail: unknown): string | null {
  const d = detail as Record<string, unknown> | null;
  if (!d) return null;
  const direct = [d.output_text, d.final_output, d.output, d.result, d.response];
  for (const v of direct) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      for (const k of ["text", "content", "output", "message"]) {
        if (typeof o[k] === "string" && (o[k] as string).trim()) return (o[k] as string).trim();
      }
    }
  }
  const msgs = (d.messages ?? (d.output as Record<string, unknown> | undefined)?.messages) as
    { role?: string; content?: unknown }[] | undefined;
  if (Array.isArray(msgs)) {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m?.role === "assistant" && typeof m.content === "string" && m.content.trim())
        return m.content.trim();
    }
  }
  return null;
}

async function readRunId(body: ReadableStream<Uint8Array>, ctl: AbortController) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let sep: number;
      while ((sep = buf.indexOf("\n\n")) >= 0) {
        const chunk = buf.slice(0, sep);
        buf = buf.slice(sep + 2);
        const data = chunk
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim())
          .join("\n");
        if (!data) continue;
        try {
          const p = JSON.parse(data) as Record<string, unknown>;
          const id = p.run_id ?? p.id ?? p.runId;
          if (id) {
            ctl.abort();
            return String(id);
          }
        } catch {
          /* not JSON, keep reading */
        }
      }
    }
  } catch {
    /* aborted once we have the id, or the edge closed the stream */
  }
  return null;
}

export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }): Promise<AdvisorReply> => {
    const base = process.env.MYCEL_API_BASE?.replace(/\/$/, "");
    const key = process.env.MYCEL_16X9_API_KEY;
    if (!base || !key) return { ok: false, reason: "offline" };

    const turns = validate(data);
    if (!turns) return { ok: false, reason: "invalid" };

    const visitor =
      (getRequestHeader("x-forwarded-for") ?? "").split(",")[0].trim() ||
      getRequestHeader("x-real-ip") ||
      "unknown";
    if (!allowed(visitor)) return { ok: false, reason: "busy" };

    const input = turns
      .map((t) => `${t.role === "visitor" ? "Visitor" : "Advisor"}: ${t.text}`)
      .join("\n");
    const headers = {
      Authorization: `Bearer ${key}`,
      "X-Mycel-Ecosystem": ECO,
      "Content-Type": "application/json",
    };
    const deadline = Date.now() + DEADLINE_MS;
    try {
      const ctl = new AbortController();
      const res = await fetch(`${base}/api/sdk/agents/${AGENT}/run/stream`, {
        method: "POST",
        headers: { ...headers, Accept: "text/event-stream" },
        body: JSON.stringify({ input }),
        signal: ctl.signal,
      });
      if (!res.ok || !res.body) return { ok: false, reason: "error" };
      const runId = await readRunId(res.body, ctl);
      if (!runId) return { ok: false, reason: "error" };

      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        const r = await fetch(`${base}/api/sdk/runs/${encodeURIComponent(runId)}`, {
          headers,
          signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) continue;
        const detail = (await r.json()) as Record<string, unknown>;
        const status = String(detail.status ?? "").toLowerCase();
        if (["failed", "error", "cancelled", "canceled"].includes(status))
          return { ok: false, reason: "error" };
        if (["completed", "succeeded", "success", "done", "finished"].includes(status)) {
          const text = replyText(detail);
          return text ? { ok: true, text: text.slice(0, 1500) } : { ok: false, reason: "error" };
        }
      }
      return { ok: false, reason: "error" };
    } catch {
      return { ok: false, reason: "error" };
    }
  });
