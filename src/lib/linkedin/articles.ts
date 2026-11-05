/**
 * Public Intel articles. The face gate is the same kind of last door as
 * src/lib/industry-notes.ts: published, public, long enough, sourced, no pipeline talk.
 * /intel stays the external daily wire. These pages live at /articles.
 */

const PIPELINE =
  /\b(?:PASS_WITH_WARNINGS|INCONCLUSIVE|PASS|BLOCK)\b(?!,?\s+(?:Inc|Corp|LLC|Ltd|Group)\b)|\b(?:scorer|evidence_unit|py_runner|idempotency|run_id|agent run|confidence_score)\b/;

export const MIN_CHARS = 600;
export const MIN_PARAGRAPHS = 2;

export type ArticleSource = { name: string; url: string };

export type Article = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  sources: ArticleSource[];
  publishedAt: string;
};

export type ArticleRow = Record<string, unknown>;

const str = (v: unknown) => (v == null ? "" : String(v)).trim();

export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function sourcesOf(value: unknown): ArticleSource[] {
  const list = Array.isArray(value) ? value : [];
  const out: ArticleSource[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const name = str(
      (item as { name?: unknown; title?: unknown }).name || (item as { title?: unknown }).title,
    );
    const url = str((item as { url?: unknown }).url);
    if (name && /^https?:\/\//.test(url)) out.push({ name, url });
  }
  return out;
}

/** True when a row may be shown on the public article pages. */
export function passesArticleGate(row: ArticleRow): boolean {
  if (str(row.status) !== "published") return false;
  if (str(row.audience) !== "public") return false;
  const title = str(row.title);
  const body = str(row.body);
  const sources = sourcesOf(row.sources);
  if (!title || !str(row.slug)) return false;
  if (body.length < MIN_CHARS) return false;
  if (paragraphs(body).length < MIN_PARAGRAPHS) return false;
  if (sources.length < 1) return false;
  if (PIPELINE.test(title) || PIPELINE.test(body)) return false;
  return true;
}

export function toArticle(row: ArticleRow): Article {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    dek: str(row.dek),
    body: str(row.body),
    sources: sourcesOf(row.sources),
    publishedAt: str(row.published_at).slice(0, 10),
  };
}

export function visibleArticles(rows: ArticleRow[]): Article[] {
  return rows
    .filter(passesArticleGate)
    .map(toArticle)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
