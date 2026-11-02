import { createServerFn } from "@tanstack/react-start";

// Industry notes (READ path): short, dated, sourced notes about what is changing in each
// industry we serve, written by the 16x9 intel desk on Mycel and shown on /industries/$slug.
//
// Same architecture as Frontier Desk's /intel and /markets (frontierdesk repo:
// src/app/_lib/market-notes.ts, fd-coverage.ts, face-gate.ts):
//   collectors (pinned scripts, no model) -> Mycel tables -> one synthesis agent that may only
//   copy the facts it was given -> a publish gate -> rows marked status=published.
// The site only reads. Writes happen inside Mycel, never from here.
//
// Read shape (Mycel Business Data REST, mirrors FD's mycel-data.ts):
//   GET {MYCEL_API_BASE}/api/business-private/x9_industry_note
//       ?ecosystem_id={eco}&col_filters={"status":"published"}&limit=200
//   Headers: Authorization: Bearer {MYCEL_16X9_API_KEY}, Accept: application/json,
//            X-Mycel-Organization: {MYCEL_16X9_ORG_ID} when set
//   Envelope: { x9_industry_note: Row[], total }
// col_filters is single-column equality, so audience and industry are filtered here.
//
// HARD CONSTRAINT: coded against env only. With MYCEL_API_BASE or MYCEL_16X9_API_KEY unset the
// read returns null and the section does not render. A missing note is better than a wrong one.
// Any failed read also returns null and is never cached.
//
// Env:
//   MYCEL_API_BASE          Mycel API base
//   MYCEL_16X9_API_KEY      16x9-scoped mycel_* key (1Password: "API Credentials - Mycel 16x9 site")
//   MYCEL_16X9_ECOSYSTEM_ID 16x9 ecosystem, full UUID (required)
//   MYCEL_16X9_ORG_ID       optional org header

export const NOTE_TABLE = "x9_industry_note";
// No default: only a short id prefix (318b5ffd) is on record, and a wrong id reads someone else's rows.
const ECO = process.env.MYCEL_16X9_ECOSYSTEM_ID || "";
const TTL = 6 * 60 * 60 * 1000; // six hours, like FD's coverage band
const MAX_AGE_DAYS = 60;

export type IndustryNote = {
  title: string;
  body: string;
  source: string;
  url: string;
  date: string;
};

type Row = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v)).trim();

/**
 * The last door before the page, in the spirit of FD's face-gate.ts: a row that carries
 * pipeline vocabulary, has no source, or is not marked public does not render, whatever its
 * status says. Each rule names a category, not a word list.
 */
const PIPELINE =
  /\b(?:PASS_WITH_WARNINGS|INCONCLUSIVE|PASS|BLOCK)\b(?!,?\s+(?:Inc|Corp|LLC|Ltd|Group)\b)|\b(?:scorer|evidence_unit|py_runner|idempotency|run_id|agent run|confidence_score)\b/;
const PRICE = /\b(?:valuation|multiple of|guarantee[ds]?|we promise)\b/i;

export function passesGate(r: Row): boolean {
  if (str(r.status) !== "published") return false;
  if (str(r.audience) !== "public") return false;
  const title = str(r.title);
  const body = str(r.body);
  const url = str(r.source_url);
  if (!title || !body || !str(r.source_name) || !/^https?:\/\//.test(url)) return false;
  if (PIPELINE.test(title) || PIPELINE.test(body)) return false;
  if (PRICE.test(title) || PRICE.test(body)) return false;
  return true;
}

/** Strip a row to the five fields a reader may see. Ids, scores and run data never leave. */
function project(r: Row): IndustryNote {
  return {
    title: str(r.title),
    body: str(r.body),
    source: str(r.source_name),
    url: str(r.source_url),
    date: str(r.published_at).slice(0, 10),
  };
}

let cache: { at: number; rows: Row[] } | null = null;

async function readPublished(): Promise<Row[] | null> {
  const base = process.env.MYCEL_API_BASE;
  const key = process.env.MYCEL_16X9_API_KEY;
  if (!base || !key || !ECO) return null;
  if (cache && Date.now() - cache.at < TTL) return cache.rows;
  const qs = new URLSearchParams({
    ecosystem_id: ECO,
    col_filters: JSON.stringify({ status: "published" }),
    limit: "200",
  });
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
  };
  const org = process.env.MYCEL_16X9_ORG_ID;
  if (org) headers["X-Mycel-Organization"] = org;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/business-private/${NOTE_TABLE}?${qs}`, {
      headers,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const rows = Array.isArray(data[NOTE_TABLE]) ? (data[NOTE_TABLE] as Row[]) : [];
    cache = { at: Date.now(), rows };
    return rows;
  } catch {
    return null;
  }
}

/** Newest published notes for one industry, or null when the desk is not connected. */
export function notesFor(
  rows: Row[],
  industry: string,
  now = Date.now(),
  limit = 3,
): IndustryNote[] {
  const floor = now - MAX_AGE_DAYS * 86400000;
  return rows
    .filter((r) => str(r.industry_key) === industry && passesGate(r))
    .filter((r) => {
      const t = Date.parse(str(r.published_at));
      return Number.isFinite(t) && t >= floor;
    })
    .sort((a, b) => Date.parse(str(b.published_at)) - Date.parse(str(a.published_at)))
    .slice(0, limit)
    .map(project);
}

export const getIndustryNotes = createServerFn({ method: "GET" })
  .inputValidator((industry: string) => industry)
  .handler(async ({ data: industry }): Promise<IndustryNote[] | null> => {
    const rows = await readPublished();
    if (!rows) return null;
    return notesFor(rows, industry);
  });
