/**
 * Deterministic approval writer, cloned from FD's executePlanDirect (FD-513).
 * One table, update only, at most three ops. buildDecisionPlan emits one.
 * Publisher fields never pass through this plan. `destination` is the only
 * field 16x9 adds to the allowlist.
 */

import { COMPANY } from "./company";
import type { Plan, PlanOp } from "./posts";

export const POST_FIELDS = new Set([
  "status",
  "final_text",
  "decided_by",
  "decided_at",
  "error",
  "destination",
]);

/** Never written by the approval route. The publisher owns these. */
export const PUBLISHER_FIELDS = new Set(["post_urn", "published_at"]);

export function guardPostPlan(plan: Plan): { ok: true } | { ok: false; reason: string } {
  if (!Array.isArray(plan.ops) || plan.ops.length < 1 || plan.ops.length > 3) {
    return { ok: false, reason: "a decision plan has one to three update ops" };
  }
  for (const op of plan.ops) {
    const reason = guardPostOp(op);
    if (reason) return { ok: false, reason };
  }
  return { ok: true };
}

function guardPostOp(op: PlanOp): string | null {
  if (op.op !== "update") return "only update operations are allowed";
  if (op.dataset !== "private" || op.table !== COMPANY.postsTable) {
    return "the decision may only update the page-post table";
  }
  if (!op.id) return "missing row id";
  for (const key of Object.keys(op.data)) {
    if (PUBLISHER_FIELDS.has(key)) return `${key} is owned by the publisher`;
    if (!POST_FIELDS.has(key)) return `${key} is not writable from approval`;
  }
  return null;
}

export type TargetWrite = {
  id: string;
  postId: string;
  target: "company" | "personal";
  status: "approved" | "published" | "failed";
  finalText: string;
  imageVersion: string;
  postUrn?: string;
  publishedAt?: string;
  error?: string;
  idempotencyKey: string;
};

const TARGET_FIELDS = new Set([
  "post_id",
  "target",
  "status",
  "final_text",
  "image_version",
  "post_urn",
  "published_at",
  "error",
  "idempotency_key",
]);

/** A target write may touch only that target's row. */
export function guardTargetWrite(row: TargetWrite): { ok: true } | { ok: false; reason: string } {
  if (row.id !== `${row.postId}:${row.target}`)
    return { ok: false, reason: "target id must be post id and target" };
  if (row.target !== "company" && row.target !== "personal")
    return { ok: false, reason: "unknown target" };
  const data = targetData(row);
  for (const key of Object.keys(data)) {
    if (!TARGET_FIELDS.has(key)) return { ok: false, reason: `${key} is not a target field` };
  }
  return { ok: true };
}

export function targetData(row: TargetWrite): Record<string, string> {
  const data: Record<string, string> = {
    post_id: row.postId,
    target: row.target,
    status: row.status,
    final_text: row.finalText,
    image_version: row.imageVersion,
    idempotency_key: row.idempotencyKey,
  };
  if (row.postUrn) data.post_urn = row.postUrn;
  if (row.publishedAt) data.published_at = row.publishedAt;
  if (row.error) data.error = row.error;
  return data;
}
