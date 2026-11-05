/**
 * Reads drafted and decided rows for /team.
 * Page load does not draw. Fixtures stand in only when X9_TEAM_FIXTURES=1 and Mycel is unset.
 */

import { blobConfigured, findStored, readChoice } from "./blob-store";
import { COMPANY } from "./company";
import {
  articleFixturesEnabled,
  fixtureArticles,
  fixtureDecided,
  fixturePosts,
  teamFixturesEnabled,
} from "./fixtures";
import { readRows, type Row } from "./mycel";
import {
  STATUSES,
  type Destination,
  type PagePost,
  type PagePostStatus,
  type PostVisual,
} from "./posts";
import { describeVisual, resolveCurrent, type VisualRow } from "./visuals";
import { visibleArticles, type Article, type ArticleRow } from "./articles";

const str = (v: unknown) => (typeof v === "string" ? v : "");

function toPost(row: Row): PagePost {
  const status = STATUSES.find((item) => item === str(row.status)) ?? "drafted";
  const destination =
    (["company", "personal", "both", "neither"] as const).find(
      (item) => item === str(row.destination),
    ) ?? "neither";
  return {
    id: str(row.id),
    noteId: str(row.note_id),
    noteTitle: str(row.note_title),
    noteUrl: str(row.note_url),
    draftText: str(row.draft_text),
    finalText: str(row.final_text),
    status,
    destination: destination as Destination,
    decidedBy: str(row.decided_by),
    decidedAt: str(row.decided_at),
    postUrn: str(row.post_urn),
    error: str(row.error),
    createdAt: str(row.created_at),
  };
}

function toVisual(row: Row): VisualRow {
  const kind = str(row.kind);
  let spec: unknown = row.spec ?? null;
  if (typeof spec === "string") {
    try {
      spec = JSON.parse(spec);
    } catch {
      spec = null;
    }
  }
  return {
    postId: str(row.post_id),
    noteId: str(row.note_id),
    kind:
      kind === "spec" || kind === "unsupported_type" || kind === "unsupported_layout"
        ? kind
        : "unknown",
    spec,
    reason: str(row.reason),
  };
}

async function visualFor(postId: string): Promise<PostVisual> {
  const rows = await readRows(COMPANY.visualsTable, "post_id", postId, 1);
  const row = rows?.[0] ? toVisual(rows[0]) : null;
  if (!row || row.kind !== "spec" || !blobConfigured()) return describeVisual(row, null);
  try {
    const choice = await readChoice(postId);
    const current = resolveCurrent(row, choice);
    const stored = await findStored(postId, current.v);
    return describeVisual(row, stored);
  } catch {
    return { state: "none", reason: "the image record could not be read" };
  }
}

export async function getPagePost(id: string): Promise<PagePost | null> {
  if (teamFixturesEnabled()) {
    const hit = [...fixturePosts(), ...fixtureDecided()].find((post) => post.id === id);
    if (hit) return hit;
  }
  const rows = await readRows(COMPANY.postsTable, "id", id, 1);
  return rows?.[0] ? toPost(rows[0]) : null;
}

export async function getReviewQueue(): Promise<{ drafted: PagePost[]; decided: PagePost[] }> {
  const lists = await Promise.all(
    STATUSES.map((status) => readRows(COMPANY.postsTable, "status", status, 50)),
  );
  const offline = lists.every((rows) => rows === null);
  if (offline && teamFixturesEnabled()) {
    return { drafted: fixturePosts(), decided: fixtureDecided().slice(0, 8) };
  }
  const posts = lists.flatMap((rows) => rows ?? []).map(toPost);
  const drafted = await Promise.all(
    posts
      .filter((post) => post.status === "drafted")
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map(async (post) => ({
        ...post,
        visual: await visualFor(post.id).catch((): PostVisual => ({
          state: "none",
          reason: "the image record could not be read",
        })),
      })),
  );
  const decided = await Promise.all(
    posts
      .filter((post) => post.status !== "drafted")
      .sort(
        (a, b) => Date.parse(b.decidedAt || b.createdAt) - Date.parse(a.decidedAt || a.createdAt),
      )
      .slice(0, 8)
      .map(async (post) => {
        if (!blobConfigured()) return post;
        try {
          const rows = await readRows(COMPANY.visualsTable, "post_id", post.id, 1);
          const row = rows?.[0] ? toVisual(rows[0]) : null;
          if (!row || row.kind !== "spec") return post;
          const stored = await findStored(
            post.id,
            resolveCurrent(row, await readChoice(post.id)).v,
          );
          return stored?.kind === "image" ? { ...post, thumbUrl: stored.url } : post;
        } catch {
          return post;
        }
      }),
  );
  return { drafted, decided };
}

export async function getArticles(): Promise<Article[]> {
  const rows = await readRows(COMPANY.articlesTable, "status", "published", 200);
  if (rows === null && articleFixturesEnabled()) return visibleArticles(fixtureArticles());
  return visibleArticles((rows ?? []) as ArticleRow[]);
}

export async function getArticle(slug: string): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find((article) => article.id === id) ?? null;
}

export type { PagePostStatus };
