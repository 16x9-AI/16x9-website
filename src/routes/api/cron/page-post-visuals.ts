import { createFileRoute } from "@tanstack/react-router";
import { authorizeCron, sweepPageVisuals } from "@/lib/linkedin/sweep";
import { blobConfigured } from "@/lib/linkedin/blob-store";
import { json } from "@/lib/linkedin/decide";
import { COMPANY } from "@/lib/linkedin/company";
import { readRows } from "@/lib/linkedin/mycel";
import { findStored, readChoice, storeFailure, storePng } from "@/lib/linkedin/blob-store";
import { resolveCurrent } from "@/lib/linkedin/visuals";
import { getArticleById, toVisual } from "@/lib/linkedin/queue";
import { defaultDraw } from "@/lib/linkedin/regen";

export const Route = createFileRoute("/api/cron/page-post-visuals")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = authorizeCron(request);
        if (denied) return denied;
        const query = new URL(request.url).searchParams;
        const result = await sweepPageVisuals(
          {
            candidates: async (only) => {
              if (only) return [only];
              const lists = await Promise.all(
                ["drafted", "approved"].map((status) =>
                  readRows(COMPANY.postsTable, "status", status, 50),
                ),
              );
              return lists
                .flatMap((rows) => rows ?? [])
                .map((row) => (typeof row.id === "string" ? row.id : ""))
                .filter(Boolean);
            },
            inspect: async (postId) => {
              const rows = await readRows(COMPANY.visualsTable, "post_id", postId, 1);
              const raw = rows?.[0];
              if (!raw) return { skip: "no visual row yet" };
              const row = toVisual(raw);
              if (row.kind !== "spec") return { skip: row.kind };
              const current = resolveCurrent(row, await readChoice(postId).catch(() => null));
              const stored = await findStored(postId, current.v).catch(() => null);
              const article = await getArticleById(row.noteId);
              return {
                postId,
                version: current.v,
                spec: current.spec,
                note: article ? { title: article.title, body: article.body } : null,
                stored: stored !== null,
              };
            },
            storeFailure,
            storePng: async (postId, version, png) => {
              await storePng(postId, version, png);
            },
            draw: (spec, note) => defaultDraw(spec, { ...note, publishedAt: "" }),
          },
          {
            postId: query.get("post") ?? undefined,
            force: query.get("force") === "1",
            configured: blobConfigured(),
          },
        );
        const failed =
          result.status !== "ok" || result.outcomes.some((item) => item.result === "error");
        return json(result, result.status === "not_configured" ? 503 : failed ? 500 : 200);
      },
    },
  },
});
