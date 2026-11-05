/**
 * GET /api/cron/page-post-visuals
 * A plain sweep needs Authorization: Bearer ${CRON_SECRET}.
 * ?post= and ?force=1 need Authorization: Bearer ${X9_PAGE_VISUALS_SECRET}.
 * Either request is refused while its secret is unset. The user agent is not a credential.
 * This route is not registered in vercel.json.
 */

import { json } from "./decide";
import { figuresNotInNote } from "./figures";
import { proseNotInNote } from "./prose";

export type SweepOutcome = {
  postId: string;
  result: "stored" | "failure_recorded" | "already_stored" | "skipped" | "error";
  detail?: string;
};

export type SweepDeps = {
  candidates: (only?: string) => Promise<string[]>;
  inspect: (postId: string) => Promise<
    | { skip: string }
    | {
        postId: string;
        version: string;
        spec: unknown;
        note: { title: string; body: string } | null;
        stored: boolean;
      }
  >;
  storeFailure: (postId: string, version: string, reason: string) => Promise<void>;
  storePng: (postId: string, version: string, png: Buffer) => Promise<void>;
  draw: (
    spec: unknown,
    note: { title: string; body: string },
  ) => Promise<
    | { status: "rendered"; png: Buffer }
    | { status: "refused"; reason: string }
    | { status: "error"; reason: string }
  >;
};

/** Idempotent sweep. Already-stored versions are skipped. Renderer crashes are not stored. */
export async function sweepPageVisuals(
  deps: SweepDeps,
  opts: { postId?: string; force?: boolean; configured?: boolean } = {},
): Promise<{
  status: "ok" | "not_configured" | "error";
  detail?: string;
  outcomes: SweepOutcome[];
}> {
  if (opts.configured === false) {
    return { status: "not_configured", detail: "BLOB_READ_WRITE_TOKEN is not set", outcomes: [] };
  }
  const outcomes: SweepOutcome[] = [];
  for (const postId of await deps.candidates(opts.postId)) {
    const row = await deps.inspect(postId);
    if ("skip" in row) {
      outcomes.push({ postId, result: "skipped", detail: row.skip });
      continue;
    }
    if (row.stored && !opts.force) {
      outcomes.push({ postId, result: "already_stored" });
      continue;
    }
    if (!row.note) {
      outcomes.push({ postId, result: "skipped", detail: "the note is not published yet" });
      continue;
    }
    const prose = proseNotInNote(row.spec, row.note.body, row.note.title);
    const figures = figuresNotInNote(row.spec, row.note.body, row.note.title);
    if (prose.length || figures.length) {
      const reason = prose.length
        ? "not the note's own words"
        : `${figures.length} figure token(s) not found verbatim in the note`;
      await deps.storeFailure(postId, row.version, reason);
      outcomes.push({ postId, result: "failure_recorded", detail: reason });
      continue;
    }
    const drawn = await deps.draw(row.spec, row.note);
    if (drawn.status === "rendered") {
      await deps.storePng(postId, row.version, drawn.png);
      outcomes.push({ postId, result: "stored" });
    } else if (drawn.status === "error") {
      outcomes.push({ postId, result: "error", detail: drawn.reason });
    } else {
      await deps.storeFailure(postId, row.version, drawn.reason);
      outcomes.push({ postId, result: "failure_recorded", detail: drawn.reason });
    }
  }
  return { status: "ok", outcomes };
}

export function authorizeCron(request: Request): Response | null {
  const query = new URL(request.url).searchParams;
  const targeted = query.has("post") || query.has("force");
  const name = targeted ? "X9_PAGE_VISUALS_SECRET" : "CRON_SECRET";
  const secret = targeted ? process.env.X9_PAGE_VISUALS_SECRET : process.env.CRON_SECRET;
  if (!secret) return json({ status: "forbidden", message: `${name} is not set` }, 403);
  if (request.headers.get("authorization") !== `Bearer ${secret}`)
    return json({ status: "forbidden" }, 403);
  return null;
}
