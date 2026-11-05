import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/linkedin/decide";
import { requestCookieStore } from "@/lib/linkedin/http-cookies";
import { blobConfigured } from "@/lib/linkedin/blob-store";
import { defaultDraw, regeneratePostVisual } from "@/lib/linkedin/regen";
import { getPagePost } from "@/lib/linkedin/queue";
import { readSessionToken, SESSION_COOKIE } from "@/lib/linkedin/session-token";
import { isTeamEmail } from "@/lib/linkedin/team";
import {
  findStored,
  readChoice,
  storeChoice,
  storeFailure,
  storePng,
} from "@/lib/linkedin/blob-store";
import { readRows, requestPageVisualSpec } from "@/lib/linkedin/mycel";
import { COMPANY } from "@/lib/linkedin/company";
import { getArticleById } from "@/lib/linkedin/queue";
import type { VisualRow } from "@/lib/linkedin/visuals";

export const Route = createFileRoute("/api/team/linkedin/visual")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = requestCookieStore(request).get(SESSION_COOKIE);
        const session = token ? await readSessionToken(token, process.env.AUTH_SECRET || "") : null;
        if (!session || !isTeamEmail(session.email)) return json({ status: "forbidden" }, 403);

        let id = "";
        try {
          const body = (await request.json()) as { id?: unknown };
          id = typeof body.id === "string" ? body.id : "";
        } catch {
          return json({ status: "error", detail: "invalid JSON" }, 400);
        }

        const result = await regeneratePostVisual(id, session.email, {
          blobReady: blobConfigured,
          getPost: getPagePost,
          getVisual: async (postId) => {
            const rows = await readRows(COMPANY.visualsTable, "post_id", postId, 1);
            const row = rows?.[0];
            if (!row) return null;
            const kind = typeof row.kind === "string" ? row.kind : "";
            return {
              postId,
              noteId: typeof row.note_id === "string" ? row.note_id : "",
              kind:
                kind === "spec" || kind === "unsupported_type" || kind === "unsupported_layout"
                  ? kind
                  : "unknown",
              spec: row.spec,
              reason: typeof row.reason === "string" ? row.reason : "",
            } satisfies VisualRow;
          },
          readChoice,
          findStored,
          storePng,
          storeFailure,
          storeChoice,
          noteFor: async (noteId) => {
            const article = await getArticleById(noteId);
            if (!article) return null;
            return { title: article.title, body: article.body, publishedAt: article.publishedAt };
          },
          requestSpec: requestPageVisualSpec,
          draw: defaultDraw,
        });
        if (result.status !== "ok")
          return json({ status: "error", detail: result.detail }, result.code);
        return json({
          status: "ok",
          imageUrl: result.imageUrl,
          drew: result.drew,
          kind: result.kind,
        });
      },
    },
  },
});
