/**
 * Decision plan for one drafted LinkedIn post.
 * Cloned from frontierdesk `src/app/_lib/linkedin-page-posts.ts`:
 * one update, exact trimmed text, 3,000-character cap, UUID required.
 * 16x9 adds `destination` on approve only.
 */

import { COMPANY, POST_MAX, UUID } from "./company";

export { POST_MAX };

export type PagePostStatus = "drafted" | "approved" | "rejected" | "published" | "failed";
export const STATUSES: PagePostStatus[] = [
  "drafted",
  "approved",
  "rejected",
  "published",
  "failed",
];

export type Destination = "company" | "personal" | "both" | "neither";
export const DESTINATIONS: Destination[] = ["company", "personal", "both", "neither"];

export type TargetName = "company" | "personal";

export type PostVisual =
  { state: "ready"; imageUrl: string } | { state: "pending" } | { state: "none"; reason: string };

export type PagePost = {
  id: string;
  noteId: string;
  noteTitle: string;
  noteUrl: string;
  draftText: string;
  finalText: string;
  status: PagePostStatus;
  destination: Destination;
  decidedBy: string;
  decidedAt: string;
  postUrn: string;
  error: string;
  createdAt: string;
  visual?: PostVisual;
  thumbUrl?: string;
};

export type PlanOp = {
  op: "update";
  ref: string;
  dataset: "private";
  table: string;
  id: string;
  data: Record<string, string>;
};

export type Plan = { version: 1; ops: PlanOp[]; resolved: { post: string } };

export type Decision = {
  id: string;
  decision: "approve" | "reject";
  text?: string;
  actor: string;
  at: string;
  destination?: Destination;
};

export function parseDestination(value: unknown): Destination | null {
  return typeof value === "string" && (DESTINATIONS as string[]).includes(value)
    ? (value as Destination)
    : null;
}

export function destinationFromChecks(company: boolean, personal: boolean): Destination {
  if (company && personal) return "both";
  if (company) return "company";
  if (personal) return "personal";
  return "neither";
}

export function targetsFor(destination: Destination): TargetName[] {
  if (destination === "both") return ["company", "personal"];
  if (destination === "company" || destination === "personal") return [destination];
  return [];
}

/** The Approve button names where the post will go. Reject stays the word Reject. */
export function approveLabel(destination: Destination): string {
  if (destination === "company") return "Approve for 16x9 company page";
  if (destination === "personal") return "Approve for Nelson personal";
  if (destination === "both") return "Approve for company page and Nelson personal";
  return "Approve (no LinkedIn destination)";
}

export function buildDecisionPlan(
  d: Decision,
): { status: "planned"; plan: Plan } | { status: "invalid"; reason: string } {
  if (!UUID.test(d.id)) return { status: "invalid", reason: "invalid id" };
  const text = (d.text ?? "").trim();
  if (d.decision === "approve" && !text)
    return { status: "invalid", reason: "an approved post needs its text" };
  if (text.length > POST_MAX) {
    return { status: "invalid", reason: `the post is over LinkedIn's ${POST_MAX}-character limit` };
  }
  const destination = d.destination ?? "neither";
  if (!DESTINATIONS.includes(destination))
    return { status: "invalid", reason: "invalid destination" };

  const data: Record<string, string> =
    d.decision === "approve"
      ? {
          status: "approved",
          final_text: text,
          decided_by: d.actor,
          decided_at: d.at,
          destination,
        }
      : { status: "rejected", decided_by: d.actor, decided_at: d.at };

  const op: PlanOp = {
    op: "update",
    ref: "decision",
    dataset: "private",
    table: COMPANY.postsTable,
    id: d.id,
    data,
  };
  return { status: "planned", plan: { version: 1, ops: [op], resolved: { post: d.id } } };
}
