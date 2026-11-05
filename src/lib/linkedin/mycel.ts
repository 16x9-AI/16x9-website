/**
 * Mycel read and the deterministic decision write.
 * Reads match src/lib/industry-notes.ts. Writes are refused by the guard
 * before any request. Unset MYCEL_API_BASE or MYCEL_16X9_API_KEY means no call.
 */

import { COMPANY, ecosystemId, mycelConfigured } from "./company";
import type { Plan } from "./posts";
import { guardPostPlan, guardTargetWrite, targetData, type TargetWrite } from "./write-guard";

const draftClaims = new Set<string>();

export function claimDraft(id: string): boolean {
  if (draftClaims.has(id)) return false;
  draftClaims.add(id);
  return true;
}

export function releaseDraft(id: string): void {
  draftClaims.delete(id);
}

export function resetDraftClaims(): void {
  draftClaims.clear();
}

export type Row = Record<string, unknown>;

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.MYCEL_16X9_API_KEY}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Mycel-Organization": process.env.MYCEL_16X9_ORG_ID || "869d903e-d7ec-43c9-b901-e7f24bffa989",
    "X-Mycel-Ecosystem": ecosystemId(),
  };
}

function baseUrl(): string | null {
  const base = process.env.MYCEL_API_BASE?.replace(/\/$/, "");
  if (!base || !process.env.MYCEL_16X9_API_KEY) return null;
  return base;
}

/** One equality filter, same shape as the industry-note reader. Null when the desk is offline or the read fails. */
export async function readRows(
  table: string,
  column: string,
  value: string,
  limit = 50,
): Promise<Row[] | null> {
  const base = baseUrl();
  if (!base) return null;
  const qs = new URLSearchParams({
    ecosystem_id: ecosystemId(),
    col_filters: JSON.stringify({ [column]: value }),
    limit: String(limit),
  });
  try {
    const res = await fetch(`${base}/api/business-private/${table}?${qs}`, {
      headers: headers(),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const rows = data[table];
    return Array.isArray(rows) ? (rows as Row[]) : [];
  } catch {
    return null;
  }
}

export type WriteResult =
  | { status: "received" }
  | { status: "error"; detail: string }
  | { status: "not_configured" }
  | { status: "conflict"; detail: string };

type RowAttempt = WriteResult | { status: "missing" };

async function sendRow(
  method: "PATCH" | "POST",
  url: string,
  data: Record<string, string>,
): Promise<RowAttempt> {
  try {
    const res = await fetch(url, {
      method,
      headers: headers(),
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status === 404) return { status: "missing" };
    if (res.status === 409 || res.status === 412)
      return { status: "conflict", detail: "already decided" };
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { status: "error", detail: detail.slice(0, 300) || `write failed (${res.status})` };
    }
    return { status: "received" };
  } catch (err) {
    return { status: "error", detail: err instanceof Error ? err.message : "write failed" };
  }
}

async function patchRow(
  table: string,
  id: string,
  data: Record<string, string>,
  onlyIf?: Record<string, string>,
): Promise<RowAttempt> {
  const base = baseUrl();
  if (!base) return { status: "not_configured" };
  const qs = new URLSearchParams({ ecosystem_id: ecosystemId() });
  if (onlyIf) qs.set("only_if", JSON.stringify(onlyIf));
  const url = `${base}/api/business-private/${table}/${encodeURIComponent(id)}?${qs}`;
  const wrote = await sendRow("PATCH", url, data);
  if (onlyIf && (wrote.status === "missing" || wrote.status === "conflict")) {
    return { status: "conflict", detail: "already decided" };
  }
  return wrote;
}

async function postRow(
  table: string,
  id: string,
  data: Record<string, string>,
): Promise<WriteResult> {
  const base = baseUrl();
  if (!base) return { status: "not_configured" };
  const url = `${base}/api/business-private/${table}?ecosystem_id=${encodeURIComponent(ecosystemId())}`;
  const wrote = await sendRow("POST", url, { id, ...data });
  if (wrote.status === "missing") return { status: "error", detail: "insert missed" };
  if (wrote.status === "conflict") return { status: "error", detail: wrote.detail };
  return wrote;
}

/** Update a row, and insert it with the same id when the update finds nothing. */
export async function upsertRow(
  table: string,
  id: string,
  data: Record<string, string>,
  io: {
    update: (table: string, id: string, data: Record<string, string>) => Promise<RowAttempt>;
    insert: (table: string, id: string, data: Record<string, string>) => Promise<WriteResult>;
  } = { update: patchRow, insert: postRow },
): Promise<WriteResult> {
  const updated = await io.update(table, id, data);
  if (updated.status === "missing") return io.insert(table, id, data);
  return updated;
}

/** Apply a decision plan. The guard runs first. Publisher fields cannot ride along. */
export async function submitLinkedInPostPlan(plan: Plan): Promise<WriteResult> {
  const guarded = guardPostPlan(plan);
  if (!guarded.ok) return { status: "error", detail: guarded.reason };
  if (!mycelConfigured()) return { status: "not_configured" };
  const guardsDecision = plan.ops.some(
    (op) => op.data.status === "approved" || op.data.status === "rejected",
  );
  const claimId = guardsDecision ? plan.ops[0]?.id : "";
  if (claimId && !claimDraft(claimId)) return { status: "conflict", detail: "already decided" };
  try {
    for (const op of plan.ops) {
      const conditional = op.data.status === "approved" || op.data.status === "rejected";
      const wrote = await patchRow(
        op.table,
        op.id,
        op.data,
        conditional ? { status: "drafted" } : undefined,
      );
      if (wrote.status !== "received") {
        if (claimId) releaseDraft(claimId);
        if (wrote.status === "conflict" || wrote.status === "missing") {
          return {
            status: "conflict",
            detail: "detail" in wrote ? wrote.detail : "already decided",
          };
        }
        return wrote;
      }
    }
    return { status: "received" };
  } catch (err) {
    if (claimId) releaseDraft(claimId);
    return { status: "error", detail: err instanceof Error ? err.message : "write failed" };
  }
}

export async function writeTarget(row: TargetWrite): Promise<WriteResult> {
  const guarded = guardTargetWrite(row);
  if (!guarded.ok) return { status: "error", detail: guarded.reason };
  if (!mycelConfigured()) return { status: "not_configured" };
  return upsertRow(COMPANY.targetsTable, row.id, targetData(row));
}

export type VisualSpecRequest = {
  note_id: string;
  note_title: string;
  different_from: {
    kind: string;
    kinds_tried: string[];
    headline: string;
    subhead: string;
    sentences: string[];
  };
  last_failure?: string;
};

const AGENT_POLL_MS = () => Number(process.env.X9_AGENT_POLL_MS) || 1000;
const AGENT_DEADLINE_MS = 50_000;

function outputRecord(detail: Record<string, unknown>): Record<string, unknown> {
  for (const key of ["output", "result", "response", "final_output"]) {
    const value = detail[key];
    if (value && typeof value === "object" && !Array.isArray(value))
      return value as Record<string, unknown>;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
          return parsed as Record<string, unknown>;
      } catch {
        /* not JSON */
      }
    }
  }
  return detail;
}

async function readRunId(
  body: ReadableStream<Uint8Array>,
  ctl: AbortController,
): Promise<string | null> {
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
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");
        if (!data) continue;
        try {
          const parsed = JSON.parse(data) as Record<string, unknown>;
          const id = parsed.run_id ?? parsed.id ?? parsed.runId;
          if (id) {
            ctl.abort();
            return String(id);
          }
        } catch {
          /* keep reading */
        }
      }
    }
  } catch {
    /* aborted once the id is in hand */
  }
  return null;
}

/** POST the stream, keep only the run id, then poll /api/sdk/runs/<id>. Same shape as the site advisor. */
export async function runAgent(
  agent: string,
  input: unknown,
): Promise<
  | { status: "ok"; output: Record<string, unknown> }
  | { status: "not_configured" }
  | { status: "error"; detail: string }
> {
  const base = baseUrl();
  if (!base) return { status: "not_configured" };
  const ctl = new AbortController();
  let runId: string | null = null;
  try {
    const res = await fetch(`${base}/api/sdk/agents/${agent}/run/stream`, {
      method: "POST",
      headers: { ...headers(), Accept: "text/event-stream" },
      body: JSON.stringify({ input: JSON.stringify(input) }),
      signal: ctl.signal,
    });
    if (!res.ok || !res.body) return { status: "error", detail: `${agent} ${res.status}` };
    runId = await readRunId(res.body, ctl);
  } catch (err) {
    if (!runId)
      return { status: "error", detail: err instanceof Error ? err.message : "run failed" };
  }
  if (!runId) return { status: "error", detail: "no run id" };
  const deadline = Date.now() + AGENT_DEADLINE_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, AGENT_POLL_MS()));
    try {
      const polled = await fetch(`${base}/api/sdk/runs/${encodeURIComponent(runId)}`, {
        headers: headers(),
        signal: AbortSignal.timeout(8_000),
      });
      if (!polled.ok) continue;
      const detail = (await polled.json()) as Record<string, unknown>;
      const status = String(detail.status ?? "").toLowerCase();
      if (["failed", "error", "cancelled", "canceled"].includes(status)) {
        return {
          status: "error",
          detail: typeof detail.error === "string" ? detail.error : "run failed",
        };
      }
      if (["completed", "succeeded", "success", "done", "finished"].includes(status)) {
        return { status: "ok", output: outputRecord(detail) };
      }
    } catch {
      /* poll again */
    }
  }
  return { status: "error", detail: "run timed out" };
}

/**
 * Spec-only mode of x9_linkedin_page_drafter. The agent returns a spec and writes nothing.
 * The site validates, draws and stores it. Disabled while Mycel is unset.
 */
export async function requestPageVisualSpec(
  req: VisualSpecRequest,
): Promise<
  | { status: "ok"; spec: unknown }
  | { status: "not_configured" }
  | { status: "error"; detail: string }
> {
  const run = await runAgent(COMPANY.drafterAgent, { mode: "spec only", ...req });
  if (run.status !== "ok") return run;
  const spec = "spec" in run.output ? run.output.spec : run.output;
  if (!spec || typeof spec !== "object")
    return { status: "error", detail: "drafter returned no spec" };
  return { status: "ok", spec };
}
