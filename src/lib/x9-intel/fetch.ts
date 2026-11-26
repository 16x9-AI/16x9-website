/**
 * 16x9 Intel daily fetch step (Linear 16X9-1670 / 16X9-1694).
 * Reads the day's research report, pulls the paragraphs of each episode's
 * source links, and stores one payload row for the Mycel agent x9_intel_collect.
 * It never publishes anything. Pure and injectable: no module state, no env reads.
 * Imports nothing from the site so Node can run it directly as erasable TypeScript.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

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
  /** Set on a primary source found by following a link inside the page at this URL. */
  via?: string;
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
  return parseReportBytes(Buffer.from(await res.arrayBuffer()), { label: `${repo}/${path}` });
}

/**
 * Shared by the GitHub read and the local-file read: parse, check shape, compute the git blob sha.
 * Error messages are fixed text plus `label`; they never quote the bytes.
 */
export function parseReportBytes(bytes: Buffer, opts: { label: string }): { report: Report; sha: string } {
  let report: Report;
  try {
    report = JSON.parse(bytes.toString("utf8")) as Report;
  } catch {
    throw new Error(`report is not valid JSON: ${opts.label}`);
  }
  if (!report || typeof report !== "object" || !Array.isArray(report.episodes)) {
    throw new Error(`report has no episodes array: ${opts.label}`);
  }
  // Git blob sha of the file, so it matches the commit view on GitHub.
  const sha = createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");
  return { report, sha };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Reads a report someone else already downloaded (no GitHub token needed).
 * With expectedDate: a report `date` that differs is an error; a missing one is filled in.
 * Without it: the report's own `date` is required and must be YYYY-MM-DD.
 */
export async function readReportFile(
  path: string,
  opts: { expectedDate?: string } = {},
): Promise<{ report: Report; sha: string; date: string }> {
  let bytes: Buffer;
  try {
    bytes = await readFile(path);
  } catch {
    throw new Error(`report file could not be read: ${path}`);
  }
  const { report, sha } = parseReportBytes(bytes, { label: path });
  const reportDate: unknown = (report as { date?: unknown }).date;
  if (opts.expectedDate !== undefined) {
    if (reportDate !== undefined && reportDate !== opts.expectedDate) {
      throw new Error(`report date does not match --date: ${path}`);
    }
    report.date = opts.expectedDate;
    return { report, sha, date: opts.expectedDate };
  }
  if (typeof reportDate !== "string" || !DATE_RE.test(reportDate)) {
    throw new Error(`report has no valid date field (YYYY-MM-DD); pass --date: ${path}`);
  }
  return { report, sha, date: reportDate };
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

export type PageLink = { url: string; text: string };

/** Anchors inside <p> blocks (same block scan as extractParagraphs), resolved against `baseUrl`. */
function extractParagraphLinks(html: string, baseUrl: string): PageLink[] {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, " ");
  const out: PageLink[] = [];
  for (const block of cleaned.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)) {
    for (const anchor of block[1].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)) {
      const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(anchor[1]);
      const raw = href ? (href[1] ?? href[2] ?? href[3] ?? "") : "";
      if (!raw.trim()) continue;
      let url: string;
      try {
        url = new URL(decodeEntities(raw.trim()), baseUrl).href;
      } catch {
        continue;
      }
      const text = decodeEntities(anchor[2].replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
      out.push({ url, text });
    }
  }
  return out;
}

const SECOND_LEVEL_LABELS = new Set(["co", "com", "org", "net", "gov", "ac", "edu"]);

function bareHost(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
}

function registrableDomain(hostname: string): string {
  const labels = bareHost(hostname).split(".");
  const keep =
    labels.length >= 3 && labels[labels.length - 1].length === 2 && SECOND_LEVEL_LABELS.has(labels[labels.length - 2])
      ? 3
      : 2;
  return labels.slice(-keep).join(".");
}

const DENY_HOSTS = [
  "news.google.com",
  "google.com",
  "googleusercontent.com",
  "twitter.com",
  "x.com",
  "t.co",
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "threads.net",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "reddit.com",
  "bit.ly",
  "wikipedia.org",
  "doubleclick.net",
  "thecube.net",
];
const DENY_PATH = /(sign-?in|log-?in|subscribe|subscription|newsletter|register|share|cookie|privacy|terms)/i;
const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|zip|mp3|mp4)$/i;

/** Cross-domain links from a page's body paragraphs that plausibly point at the primary document. */
export function pickPrimaryLinks(
  pageUrl: string,
  links: PageLink[],
  opts: { exclude?: Set<string>; max: number },
): string[] {
  let pageDomain: string;
  try {
    pageDomain = registrableDomain(new URL(pageUrl).hostname);
  } catch {
    return [];
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const link of links) {
    if (out.length >= opts.max) break;
    let u: URL;
    try {
      u = new URL(link.url);
    } catch {
      continue;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") continue;
    u.hash = "";
    const href = u.href;
    if (link.text.replace(/\s/g, "").length < 3) continue;
    const host = bareHost(u.hostname);
    if (registrableDomain(host) === pageDomain) continue;
    if (DENY_HOSTS.some((d) => host === d || host.endsWith(`.${d}`))) continue;
    if (DENY_PATH.test(u.pathname)) continue;
    if (SKIP_EXT.test(u.pathname)) continue;
    if (opts.exclude?.has(href) || seen.has(href)) continue;
    seen.add(href);
    out.push(href);
  }
  return out;
}

async function fetchOne(
  url: string,
  opts: { fetch: FetchFn; timeoutMs: number; maxBytes: number },
): Promise<{ paragraphs: string[]; links: PageLink[] }> {
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
      const body = await readCapped(res, opts.maxBytes);
      return { paragraphs: extractParagraphs(body), links: extractParagraphLinks(body, res.url || parsed.href) };
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
  opts: {
    fetch?: FetchFn;
    maxLinksPerEpisode?: number;
    timeoutMs?: number;
    maxBytes?: number;
    maxLinkedPerEpisode?: number;
    maxLinkedTotal?: number;
    linkedMaxChars?: number;
  } = {},
): Promise<SourceResult[]> {
  const doFetch = opts.fetch ?? fetch;
  const maxLinks = opts.maxLinksPerEpisode ?? 3;
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const maxBytes = opts.maxBytes ?? 2_000_000;
  const maxLinkedPerEpisode = opts.maxLinkedPerEpisode ?? 2;
  const maxLinkedTotal = opts.maxLinkedTotal ?? 24;
  const linkedMaxChars = opts.linkedMaxChars ?? 8000;
  const fetchOpts = { fetch: doFetch, timeoutMs, maxBytes };
  const results: SourceResult[] = [];
  let linkedTotal = 0;
  for (const [index, episode] of episodes.entries()) {
    const ownLinks = linkUrls(episode);
    const exclude = new Set<string>();
    for (const url of ownLinks) {
      exclude.add(url);
      exclude.add(stripHash(url));
    }
    const pages: { url: string; links: PageLink[] }[] = [];
    for (const url of ownLinks.slice(0, maxLinks)) {
      try {
        const { paragraphs, links } = await fetchOne(url, fetchOpts);
        results.push({ episode_index: index, url, paragraphs });
        pages.push({ url, links });
      } catch (err) {
        results.push({
          episode_index: index,
          url,
          paragraphs: [],
          error: err instanceof Error ? err.message : "fetch failed",
        });
      }
    }

    // Primary-source discovery: one hop from this episode's own pages, never from linked pages.
    const picked: { url: string; via: string }[] = [];
    const budget = Math.min(maxLinkedPerEpisode, maxLinkedTotal - linkedTotal);
    for (const page of pages) {
      if (picked.length >= budget) break;
      for (const url of pickPrimaryLinks(page.url, page.links, { exclude, max: budget - picked.length })) {
        exclude.add(url);
        picked.push({ url, via: page.url });
      }
    }
    for (const { url, via } of picked) {
      linkedTotal++;
      try {
        const { paragraphs } = await fetchOne(url, fetchOpts);
        results.push({
          episode_index: index,
          url,
          paragraphs: truncateParagraphs(paragraphs, linkedMaxChars),
          via,
        });
      } catch (err) {
        results.push({
          episode_index: index,
          url,
          paragraphs: [],
          via,
          error: err instanceof Error ? err.message : "fetch failed",
        });
      }
    }
  }
  return results;
}

function stripHash(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.href;
  } catch {
    return url;
  }
}

/** Whole paragraphs up to maxChars in total; the last one may be cut. */
function truncateParagraphs(paragraphs: string[], maxChars: number): string[] {
  const out: string[] = [];
  let used = 0;
  for (const text of paragraphs) {
    if (used + text.length <= maxChars) {
      out.push(text);
      used += text.length;
      continue;
    }
    const cut = text.slice(0, Math.max(0, maxChars - used)).trimEnd();
    if (cut) out.push(cut);
    break;
  }
  return out;
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
  const own = payload.sources.filter((source) => source.via === undefined);
  const linked = payload.sources.filter((source) => source.via !== undefined);
  const ok = own.filter((source) => source.paragraphs.length > 0).length;
  const linkedOk = linked.filter((source) => source.paragraphs.length > 0).length;
  return (
    `x9-intel-fetch ${payload.report_date}: ${payload.episodes.length} episodes, ` +
    `sources ${ok} ok / ${own.length - ok} failed` +
    (linked.length > 0 ? `, linked ${linkedOk} ok / ${linked.length - linkedOk} failed` : "")
  );
}
