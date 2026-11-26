/**
 * 16x9 Intel daily fetch step (Linear 16X9-1670 / 16X9-1694).
 * Reads the day's research report, pulls the paragraphs of each episode's
 * source links, and stores one payload row for the Mycel agent x9_intel_collect.
 * It never publishes anything. Pure and injectable: no module state, no env reads.
 * Imports nothing from the site so Node can run it directly as erasable TypeScript.
 */

import { createHash } from "node:crypto";

export const INPUTS_TABLE = "x9_intel_daily_inputs";
export const USER_AGENT = "16x9-intel-fetch/1.0 (+https://16x9.ai)";

export type FetchFn = typeof fetch;

export type ReportEpisode = {
  title?: string;
  stackLayer?: string;
  signalType?: string;
  summary?: string;
  whyItMatters?: string;
  keyData?: string;
  angle?: string;
  voices?: unknown;
  impact?: string;
  sources?: unknown;
  links?: unknown;
};

export type Report = {
  date: string;
  generatedAt?: string;
  episodes: ReportEpisode[];
  headlines?: unknown;
  meta?: unknown;
};

export type SourceResult = {
  episode_index: number;
  url: string;
  paragraphs: string[];
  error?: string;
};

export type Payload = {
  report_date: string;
  episodes: {
    i: number;
    title: string;
    summary: string;
    keyData: string;
    impact: string;
    stackLayer: string;
    signalType: string;
    links: string[];
  }[];
  sources: SourceResult[];
};

/** Only the real write path runs when this is true. The runner owns the gate; this is its pure core. */
export function shouldWriteMycel(opts: { dryRun: boolean; enabled: boolean | string | undefined }): boolean {
  return !opts.dryRun && (opts.enabled === true || opts.enabled === "true");
}

/* ---------- report ---------- */

export async function readReport(
  date: string,
  opts: {
    token: string;
    repo?: string;
    pathTemplate?: string;
    fetch?: FetchFn;
  },
): Promise<{ report: Report; sha: string }> {
  const repo = opts.repo ?? "16x9-AI/industry-daily-report";
  const path = (opts.pathTemplate ?? "reports/{date}.json").replace("{date}", date);
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const doFetch = opts.fetch ?? fetch;
  let res: Response;
  try {
    res = await doFetch(url, {
      headers: {
        Authorization: `Bearer ${opts.token}`,
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": USER_AGENT,
      },
    });
  } catch {
    throw new Error(`report read failed (network error) for ${repo}/${path}`);
  }
  if (res.status === 404) throw new Error(`report not found: ${repo}/${path}`);
  if (!res.ok) throw new Error(`report read failed (${res.status}) for ${repo}/${path}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  let report: Report;
  try {
    report = JSON.parse(bytes.toString("utf8")) as Report;
  } catch {
    throw new Error(`report is not valid JSON: ${repo}/${path}`);
  }
  if (!report || !Array.isArray(report.episodes)) {
    throw new Error(`report has no episodes array: ${repo}/${path}`);
  }
  // Git blob sha of the file, so it matches the commit view on GitHub.
  const sha = createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");
  return { report, sha };
}

/* ---------- paragraphs ---------- */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  copy: "©",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code < 1 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) {
        return whole;
      }
      return String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

const MIN_PARAGRAPH = 40;
const MAX_PARAGRAPHS = 60;
const MAX_CHARS = 12_000;
// Short repeated site furniture. Long paragraphs that merely mention these words are kept.
const BOILERPLATE =
  /\b(newsletter|subscribe|cookies?|sign up|all rights reserved|privacy policy|terms of (use|service)|accept all|manage preferences|follow us)\b/i;
const BOILERPLATE_MAX_LENGTH = 240;

export function extractParagraphs(html: string): string[] {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, " ");
  const seen = new Set<string>();
  const out: string[] = [];
  let chars = 0;
  for (const match of cleaned.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)) {
    // Inline tags vanish without a gap (so "<b>bo</b>ld" stays one word); <br> and nested <p> become spaces.
    const inner = match[1].replace(/<(br|p)\b[^>]*>/gi, " ").replace(/<[^>]*>/g, "");
    let text = decodeEntities(inner).replace(/\s+/g, " ").trim();
    if (text.length < MIN_PARAGRAPH) continue;
    if (text.length <= BOILERPLATE_MAX_LENGTH && BOILERPLATE.test(text)) continue;
    if (seen.has(text)) continue;
    const room = MAX_CHARS - chars;
    if (text.length > room) {
      if (room < MIN_PARAGRAPH) break;
      text = text.slice(0, room).trimEnd();
    }
    seen.add(text);
    out.push(text);
    chars += text.length;
    if (out.length >= MAX_PARAGRAPHS || chars >= MAX_CHARS) break;
  }
  return out;
}

/* ---------- sources ---------- */

function linkUrls(episode: ReportEpisode): string[] {
  const raw = Array.isArray(episode.links) ? episode.links : [];
  return raw
    .map((link) =>
      typeof link === "string"
        ? link
        : link && typeof link === "object" && typeof (link as { url?: unknown }).url === "string"
          ? (link as { url: string }).url
          : "",
    )
    .filter(Boolean);
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return (await res.text()).slice(0, maxBytes);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
    if (total >= maxBytes) {
      await reader.cancel().catch(() => undefined);
      break;
    }
  }
  return Buffer.concat(chunks).subarray(0, maxBytes).toString("utf8");
}

async function fetchOne(
  url: string,
  opts: { fetch: FetchFn; timeoutMs: number; maxBytes: number },
): Promise<string[]> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("unsupported URL scheme");
  }
  const ctl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      ctl.abort();
      reject(new Error(`timeout after ${opts.timeoutMs}ms`));
    }, opts.timeoutMs);
  });
  try {
    const work = (async () => {
      const res = await opts.fetch(parsed.href, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
        redirect: "follow",
        signal: ctl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get("content-type");
      if (type && !/html|xml/i.test(type)) throw new Error("not HTML");
      return extractParagraphs(await readCapped(res, opts.maxBytes));
    })();
    work.catch(() => undefined); // a late failure after the timeout is already reported
    return await Promise.race([work, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

/** Sequential on purpose: one request at a time keeps the crawl polite. One bad source never throws. */
export async function fetchSources(
  episodes: ReportEpisode[],
  opts: { fetch?: FetchFn; maxLinksPerEpisode?: number; timeoutMs?: number; maxBytes?: number } = {},
): Promise<SourceResult[]> {
  const doFetch = opts.fetch ?? fetch;
  const maxLinks = opts.maxLinksPerEpisode ?? 3;
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const maxBytes = opts.maxBytes ?? 2_000_000;
  const results: SourceResult[] = [];
  for (const [index, episode] of episodes.entries()) {
    for (const url of linkUrls(episode).slice(0, maxLinks)) {
      try {
        const paragraphs = await fetchOne(url, { fetch: doFetch, timeoutMs, maxBytes });
        results.push({ episode_index: index, url, paragraphs });
      } catch (err) {
        results.push({
          episode_index: index,
          url,
          paragraphs: [],
          error: err instanceof Error ? err.message : "fetch failed",
        });
      }
    }
  }
  return results;
}

/* ---------- payload ---------- */

export function buildPayload(report: Report, sources: SourceResult[]): Payload {
  const text = (value: unknown): string => (typeof value === "string" ? value : "");
  return {
    report_date: report.date,
    episodes: report.episodes.map((episode, i) => ({
      i,
      title: text(episode.title),
      summary: text(episode.summary),
      keyData: text(episode.keyData),
      impact: text(episode.impact),
      stackLayer: text(episode.stackLayer),
      signalType: text(episode.signalType),
      links: linkUrls(episode),
    })),
    sources,
  };
}

/* ---------- Mycel write ---------- */

export type UpsertResult =
  | { status: "received"; action: "inserted" | "updated" }
  | { status: "error"; detail: string };

export async function upsertDailyInput(
  payload: Payload,
  opts: {
    sha: string;
    base: string;
    apiKey: string;
    orgId: string;
    ecosystemId: string;
    fetch?: FetchFn;
    now?: () => Date;
  },
): Promise<UpsertResult> {
  const doFetch = opts.fetch ?? fetch;
  const base = opts.base.replace(/\/$/, "");
  const headers = {
    Authorization: `Bearer ${opts.apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Mycel-Organization": opts.orgId,
    "X-Mycel-Ecosystem": opts.ecosystemId,
  };
  const table = `${base}/api/business-private/${INPUTS_TABLE}`;

  let existingId: string | null = null;
  try {
    const qs = new URLSearchParams({
      ecosystem_id: opts.ecosystemId,
      col_filters: JSON.stringify({ report_date: payload.report_date }),
      limit: "1",
    });
    const res = await doFetch(`${table}?${qs}`, { headers, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return { status: "error", detail: `read failed (${res.status})` };
    const data = (await res.json()) as Record<string, unknown>;
    const rows = data[INPUTS_TABLE];
    if (!Array.isArray(rows)) return { status: "error", detail: "read returned no row list" };
    const id = (rows[0] as { id?: unknown } | undefined)?.id;
    if (typeof id === "string" && id) existingId = id;
  } catch {
    // Error messages (e.g. JSON parse errors) can quote body text, so keep this fixed.
    return { status: "error", detail: "read failed (network error, timeout or invalid response)" };
  }

  const row = {
    report_date: payload.report_date,
    payload: JSON.stringify(payload),
    episode_count: payload.episodes.length,
    source_count: payload.sources.filter((source) => source.paragraphs.length > 0).length,
    report_sha: opts.sha,
    fetched_at: (opts.now?.() ?? new Date()).toISOString(),
    status: "fetched",
    source_run: "x9_intel_fetch",
  };
  const qs = `ecosystem_id=${encodeURIComponent(opts.ecosystemId)}`;
  try {
    const res = existingId
      ? await doFetch(`${table}/${encodeURIComponent(existingId)}?${qs}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(row),
          signal: AbortSignal.timeout(20_000),
        })
      : await doFetch(`${table}?${qs}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ...row, idempotency_key: `x9-input:${payload.report_date}` }),
          signal: AbortSignal.timeout(20_000),
        });
    if (!res.ok) {
      // Never echo the response body: it can repeat the payload (private report text).
      return { status: "error", detail: `write failed (${res.status})` };
    }
    return { status: "received", action: existingId ? "updated" : "inserted" };
  } catch {
    // Error messages (e.g. JSON parse errors) can quote body text, so keep this fixed.
    return { status: "error", detail: "write failed (network error or timeout)" };
  }
}

/* ---------- log summary ---------- */

/** The one line the runner may print. Date and counts only; never titles, URLs or text. */
export function summarizeRun(payload: Payload): string {
  const ok = payload.sources.filter((source) => source.paragraphs.length > 0).length;
  return (
    `x9-intel-fetch ${payload.report_date}: ${payload.episodes.length} episodes, ` +
    `sources ${ok} ok / ${payload.sources.length - ok} failed`
  );
}
