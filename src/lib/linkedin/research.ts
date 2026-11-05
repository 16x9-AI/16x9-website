/**
 * Read-only selection of one research episode from a dated industry-daily-report JSON.
 * It does not publish, draft, or post. At most one episode per report.
 * Buzz is not called from here.
 */

export type ResearchSource = { title: string; url: string };

export type ResearchEpisode = {
  id: string;
  title: string;
  summary: string;
  sources: ResearchSource[];
  date: string;
};

type Item = {
  title?: unknown;
  summary?: unknown;
  body?: unknown;
  url?: unknown;
  score?: unknown;
  sources?: unknown;
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function sourcesOf(item: Item): ResearchSource[] {
  const out: ResearchSource[] = [];
  if (Array.isArray(item.sources)) {
    for (const source of item.sources) {
      if (!source || typeof source !== "object") continue;
      const title = str(
        (source as { title?: unknown; name?: unknown }).title ||
          (source as { name?: unknown }).name,
      );
      const url = str((source as { url?: unknown }).url);
      if (/^https?:\/\//.test(url)) out.push({ title: title || url, url });
    }
  }
  const own = str(item.url);
  if (/^https?:\/\//.test(own) && !out.some((s) => s.url === own))
    out.push({ title: str(item.title) || own, url: own });
  return out;
}

/**
 * The strongest item that names at least one original http(s) source.
 * Items with no source are dropped. Ties keep the earlier item.
 */
export function selectDailyEpisode(report: unknown): ResearchEpisode | null {
  if (!report || typeof report !== "object") return null;
  const date = str((report as { date?: unknown }).date);
  const items = (report as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  let best: { score: number; index: number; item: Item; sources: ResearchSource[] } | null = null;
  items.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as Item;
    const sources = sourcesOf(item);
    const title = str(item.title);
    const summary = str(item.summary || item.body);
    if (!title || !summary || sources.length === 0) return;
    const score = typeof item.score === "number" && Number.isFinite(item.score) ? item.score : 0;
    if (!best || score > best.score) best = { score, index, item, sources };
  });
  if (!best) return null;
  const chosen: { item: Item; sources: ResearchSource[] } = best;
  const title = str(chosen.item.title);
  return {
    id: `${date || "undated"}:${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,
    title,
    summary: str(chosen.item.summary || chosen.item.body),
    sources: chosen.sources,
    date,
  };
}
