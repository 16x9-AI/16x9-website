/**
 * Different image / draw image now.
 * Cloned from frontierdesk `src/app/_lib/page-post-visual-regen.ts`.
 * Drafts only. Edited text is not an argument and is not written.
 * A failed draw keeps the previous image: a new failure record uses a new version path.
 */

import { COMPANY, UUID } from "./company";
import { figuresNotInNote } from "./figures";
import { proseNotInNote } from "./prose";
import { visualVersion, type StoredVisual, type VisualChoice } from "./blob-store";
import { resolveCurrent, specKind, type VisualRow } from "./visuals";
import type { PagePost } from "./posts";

export type RegenResult =
  | { status: "ok"; imageUrl: string; drew: "current" | "alternative"; kind: string }
  | { status: "error"; detail: string; code: number };

type Note = { title: string; body: string; publishedAt: string };
type Drawn =
  | { status: "rendered"; png: Buffer }
  | { status: "refused"; reason: string }
  | { status: "error"; reason: string };

export type RegenDeps = {
  blobReady: () => boolean;
  getPost: (id: string) => Promise<PagePost | null>;
  getVisual: (id: string) => Promise<VisualRow | null>;
  readChoice: (id: string) => Promise<VisualChoice | null>;
  findStored: (id: string, version: string) => Promise<StoredVisual>;
  storePng: (id: string, version: string, png: Buffer) => Promise<string>;
  storeFailure: (id: string, version: string, reason: string) => Promise<void>;
  storeChoice: (id: string, choice: VisualChoice) => Promise<void>;
  noteFor: (noteId: string) => Promise<Note | null>;
  requestSpec: (input: {
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
  }) => Promise<
    | { status: "ok"; spec: unknown }
    | { status: "not_configured" }
    | { status: "error"; detail: string }
  >;
  draw: (spec: unknown, note: Note) => Promise<Drawn>;
};

const ATTEMPTS = 2;

function sentencesOf(spec: unknown): string[] {
  const s = (spec ?? {}) as {
    subhead?: unknown;
    visual?: { text?: unknown; points?: unknown };
    g?: { sub3?: unknown };
  };
  const out = [str(s.subhead), str(s.visual?.text), str(s.g?.sub3)];
  if (Array.isArray(s.visual?.points)) {
    for (const point of s.visual.points) out.push(str((point as { text?: unknown })?.text));
  }
  return out.filter(Boolean);
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export async function defaultDraw(spec: unknown, note: Note): Promise<Drawn> {
  const prose = proseNotInNote(spec, note.body, note.title);
  if (prose.length) {
    return {
      status: "refused",
      reason: `not the note's own words: ${prose.map((p) => JSON.stringify(p.length > 80 ? `${p.slice(0, 77)}...` : p)).join("; ")}`,
    };
  }
  const figures = figuresNotInNote(spec, note.body, note.title);
  if (figures.length) {
    return {
      status: "refused",
      reason: `${figures.length} figure token(s) not found verbatim in the note`,
    };
  }
  try {
    const mod = (await import(/* @vite-ignore */ "../../server/page-post-visuals/index.mjs")) as {
      renderVisual: (
        spec: unknown,
        note: { text: string; date: string; title: string },
      ) => Promise<{ status: string; reason?: string; png?: Buffer }>;
    };
    const rendered = await mod.renderVisual(spec, {
      text: note.body,
      date: note.publishedAt.slice(0, 10),
      title: note.title,
    });
    if (rendered.status === "rendered" && rendered.png)
      return { status: "rendered", png: rendered.png };
    if (rendered.status === "error")
      return { status: "error", reason: rendered.reason || "the renderer failed" };
    return { status: "refused", reason: rendered.reason || "the image could not be drawn" };
  } catch (err) {
    return {
      status: "error",
      reason: `the renderer failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function regeneratePostVisual(
  postId: string,
  actor: string,
  deps: RegenDeps,
): Promise<RegenResult> {
  if (!UUID.test(postId)) return { status: "error", detail: "invalid post id", code: 400 };
  if (!deps.blobReady())
    return { status: "error", detail: "image storage is not configured", code: 503 };

  const post = await deps.getPost(postId);
  if (!post) return { status: "error", detail: "no such draft", code: 404 };
  if (post.status !== "drafted") {
    return {
      status: "error",
      detail: `already ${post.status}; a decided post keeps its image`,
      code: 409,
    };
  }

  const row = await deps.getVisual(postId);
  if (!row || row.kind !== "spec" || !row.spec || typeof row.spec !== "object") {
    return { status: "error", detail: "this draft has no image spec to draw from", code: 409 };
  }
  const note = await deps.noteFor(row.noteId);
  if (!note) return { status: "error", detail: "the note is not published", code: 409 };

  const current = resolveCurrent(row, await deps.readChoice(postId));
  const stored = await deps.findStored(postId, current.v);

  if (!stored) {
    const drawn = await deps.draw(current.spec, note);
    if (drawn.status === "rendered") {
      const url = await deps.storePng(postId, current.v, drawn.png);
      return { status: "ok", imageUrl: url, drew: "current", kind: specKind(current.spec) };
    }
    if (drawn.status === "error") return { status: "error", detail: drawn.reason, code: 502 };
    await deps.storeFailure(postId, current.v, drawn.reason);
    return alternative(postId, actor, row, note, current, drawn.reason, deps);
  }
  return alternative(
    postId,
    actor,
    row,
    note,
    current,
    stored.kind === "failure" ? stored.reason : undefined,
    deps,
  );
}

async function alternative(
  postId: string,
  actor: string,
  row: VisualRow,
  note: Note,
  current: ReturnType<typeof resolveCurrent>,
  lastFailure: string | undefined,
  deps: RegenDeps,
): Promise<RegenResult> {
  const cur = (current.spec ?? {}) as { headline?: unknown; subhead?: unknown };
  const base = {
    note_id: row.noteId,
    note_title: note.title,
    different_from: {
      kind: specKind(current.spec),
      kinds_tried: [...new Set(current.kinds)],
      headline: str(cur.headline),
      subhead: str(cur.subhead),
      sentences: sentencesOf(current.spec),
    },
  };
  let failure = lastFailure;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const asked = await deps.requestSpec(failure ? { ...base, last_failure: failure } : base);
    if (asked.status === "not_configured")
      return { status: "error", detail: "Mycel is not configured", code: 503 };
    if (asked.status === "error") return { status: "error", detail: asked.detail, code: 502 };
    const drawn = await deps.draw(asked.spec, note);
    if (drawn.status === "rendered") {
      const version = visualVersion(row.noteId, asked.spec);
      const url = await deps.storePng(postId, version, drawn.png);
      const kind = specKind(asked.spec);
      await deps.storeChoice(postId, {
        v: version,
        base: visualVersion(row.noteId, row.spec),
        spec: asked.spec,
        kinds: [...new Set([...current.kinds, kind])],
        at: new Date().toISOString(),
        by: actor,
      });
      return { status: "ok", imageUrl: url, drew: "alternative", kind };
    }
    if (drawn.status === "error") return { status: "error", detail: drawn.reason, code: 502 };
    failure = drawn.reason;
  }
  return { status: "error", detail: `a different image could not be drawn: ${failure}`, code: 422 };
}

export const VISUAL_TABLE = COMPANY.visualsTable;
