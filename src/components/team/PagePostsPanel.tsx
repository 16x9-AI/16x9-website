import type { PagePost } from "@/lib/linkedin/posts";
import { ImageThumb } from "./ImageLightbox";
import { PagePostReview } from "./PagePostReview";

function when(value: string): string {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "";
  return new Date(time).toISOString().slice(0, 10);
}

/** Pending drafts, newest first, then the latest decided rows. */
export function PagePostsPanel({ drafted, decided }: { drafted: PagePost[]; decided: PagePost[] }) {
  return (
    <section id="page-posts" className="grid gap-10">
      <div className="grid gap-6">
        <h2 id="page-posts-h" className="font-editorial text-3xl text-ink">
          LinkedIn
        </h2>
        {drafted.length === 0 ? (
          <p className="text-sm text-graphite">No drafts waiting.</p>
        ) : (
          drafted.map((post) => (
            <article key={post.id} className="grid gap-3 border-t border-ink/15 pt-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                Draft
              </p>
              <a href={post.noteUrl} className="text-sm text-ink underline underline-offset-4">
                {post.noteTitle}
              </a>
              <PagePostReview
                id={post.id}
                draft={post.draftText}
                visual={post.visual}
                title={post.noteTitle}
              />
            </article>
          ))
        )}
      </div>
      <div className="grid gap-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">Decided</h3>
        {decided.length === 0 ? (
          <p className="text-sm text-graphite">Nothing decided yet.</p>
        ) : (
          <ul className="grid gap-3">
            {decided.map((post) => (
              <li
                key={post.id}
                className="flex items-start justify-between gap-4 border-t border-ink/15 pt-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink">{post.noteTitle}</p>
                  <p className="mt-1 text-[13px] text-graphite">
                    {post.status}
                    {post.decidedBy ? ` · ${post.decidedBy}` : ""}
                    {post.decidedAt ? ` · ${when(post.decidedAt)}` : ""}
                    {post.postUrn ? ` · ${post.postUrn}` : ""}
                  </p>
                </div>
                {post.thumbUrl ? (
                  <ImageThumb src={post.thumbUrl} alt="" caption={post.noteTitle} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
