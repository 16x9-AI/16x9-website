/**
 * Mycel read and the deterministic decision write.
 * Reads match src/lib/industry-notes.ts. Writes are refused by the guard
 * before any request. Unset MYCEL_API_BASE or MYCEL_16X9_API_KEY means no call.
 */

import { COMPANY, ecosystemId, mycelConfigured } from "./company";
import type { Plan } from "./posts";
import { guardPostPlan, guardTargetWrite, targetData, type TargetWrite } from "./write-guard";

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
  { status: "received" } | { status: "error"; detail: string } | { status: "not_configured" };

async function patchRow(
  table: string,
  id: string,
  data: Record<string, string>,
): Promise<WriteResult> {
  const base = baseUrl();
  if (!base) return { status: "not_configured" };
  try {
    const url = `${base}/api/business-private/${table}/${encodeURIComponent(id)}?ecosystem_id=${encodeURIComponent(ecosystemId())}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { status: "error", detail: detail.slice(0, 300) || `write failed (${res.status})` };
    }
    return { status: "received" };
  } catch (err) {
    return { status: "error", detail: err instanceof Error ? err.message : "write failed" };
  }
}

/** Apply a decision plan. The guard runs first. Publisher fields cannot ride along. */
export async function submitLinkedInPostPlan(plan: Plan): Promise<WriteResult> {
  const guarded = guardPostPlan(plan);
  if (!guarded.ok) return { status: "error", detail: guarded.reason };
  if (!mycelConfigured()) return { status: "not_configured" };
  for (const op of plan.ops) {
    const wrote = await patchRow(op.table, op.id, op.data);
    if (wrote.status !== "received") return wrote;
  }
  return { status: "received" };
}

export async function writeTarget(row: TargetWrite): Promise<WriteResult> {
  const guarded = guardTargetWrite(row);
  if (!guarded.ok) return { status: "error", detail: guarded.reason };
  if (!mycelConfigured()) return { status: "not_configured" };
  return patchRow(COMPANY.targetsTable, row.id, targetData(row));
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
  const base = baseUrl();
  if (!base) return { status: "not_configured" };
  try {
    const res = await fetch(`${base}/api/sdk/agents/${COMPANY.drafterAgent}/run/stream`, {
      method: "POST",
      headers: { ...headers(), Accept: "application/json" },
      body: JSON.stringify({ input: JSON.stringify({ mode: "spec only", ...req }) }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return { status: "error", detail: `drafter ${res.status}` };
    const data = (await res.json()) as { spec?: unknown; output?: { spec?: unknown } };
    const spec = data.spec ?? data.output?.spec;
    if (!spec || typeof spec !== "object")
      return { status: "error", detail: "drafter returned no spec" };
    return { status: "ok", spec };
  } catch (err) {
    return { status: "error", detail: err instanceof Error ? err.message : "drafter failed" };
  }
}
