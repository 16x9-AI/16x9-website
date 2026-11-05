/**
 * What /team shows for one draft's image. Page load only reads storage.
 * Cloned from frontierdesk `src/app/_lib/linkedin-page-visuals.ts`.
 */

import type { StoredVisual, VisualChoice } from "./blob-store";
import { visualVersion } from "./blob-store";
import type { PostVisual } from "./posts";

export type VisualKind = "spec" | "unsupported_type" | "unsupported_layout" | "unknown";

export type VisualRow = {
  postId: string;
  noteId: string;
  kind: VisualKind;
  spec: unknown;
  reason: string;
};

export function specKind(spec: unknown): string {
  const s = spec as { visual?: { kind?: unknown }; g?: unknown } | null;
  if (
    s &&
    typeof s === "object" &&
    s.visual &&
    typeof s.visual === "object" &&
    typeof s.visual.kind === "string"
  ) {
    return s.visual.kind;
  }
  if (s && typeof s === "object" && s.g) return "g";
  return "unknown";
}

export type CurrentVisual = { v: string; spec: unknown; kinds: string[]; chosen: boolean };

/** A choice applies only while it was made against the current agent spec. */
export function resolveCurrent(
  row: Pick<VisualRow, "noteId" | "spec">,
  choice: VisualChoice | null,
): CurrentVisual {
  const base = visualVersion(row.noteId, row.spec);
  if (choice && choice.base === base)
    return { v: choice.v, spec: choice.spec, kinds: choice.kinds, chosen: true };
  return { v: base, spec: row.spec, kinds: [specKind(row.spec)], chosen: false };
}

export function describeVisual(row: VisualRow | null, stored: StoredVisual): PostVisual {
  if (!row) return { state: "none", reason: "no image has been specified for this draft" };
  if (row.kind === "unsupported_type" || row.kind === "unsupported_layout") {
    const what =
      row.kind === "unsupported_type"
        ? "this kind of note has no image layout"
        : "this note does not fit any image layout";
    return { state: "none", reason: row.reason ? `${what} (${row.reason})` : what };
  }
  if (row.kind !== "spec" || !row.spec || typeof row.spec !== "object") {
    return { state: "none", reason: "the saved image spec is unreadable" };
  }
  if (stored?.kind === "image") return { state: "ready", imageUrl: stored.url };
  if (stored?.kind === "failure") return { state: "none", reason: stored.reason };
  return { state: "pending" };
}
