import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Footer } from "@/components/site/Footer";
import { Motif } from "@/components/site/Motif";
import { Nav } from "@/components/site/Nav";
import { PageFront, SectionHead } from "@/components/site/Services";
import { getArticles } from "@/lib/linkedin/queue";
import { breadcrumbs, pageHead } from "@/lib/seo";

const loadArticles = createServerFn({ method: "GET" }).handler(async () => getArticles());

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

export const Route = createFileRoute("/articles/")({
  head: () =>
    pageHead({
      title: "Intel articles | 16x9",
      description:
        "Sourced notes from the 16x9 research desk. One subject, read at the original source.",
      path: "/articles",
      jsonLd: [
        breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Articles", path: "/articles" },
        ]),
      ],
    }),
  loader: () => loadArticles(),
  component: ArticlesPage,
});

function ArticlesPage() {
  const articles = Route.useLoaderData();
  const [lead, ...rest] = articles;

  return (
    <>
      <Nav />
      <main>
        <PageFront
          title="One subject, read at the source."
          lede={
            <p>
              Sourced notes from the research desk. Each note names the page it read. The daily
              briefing stays on <a href="/intel">Intel</a>.
            </p>
          }
          aside={
            <a href="/intel" className="group block">
              <p className={`${mono} text-graphite`}>Daily briefing</p>
              <div className="mt-3 hidden aspect-video w-full overflow-hidden border border-ink/80 text-ink sm:block">
                <Motif kind="lines" />
              </div>
              <p className="mt-3 text-[14px] font-medium leading-snug text-ink">Intel</p>
              <p className="mt-1 text-[13.5px] leading-[1.5] text-graphite">
                About 1,800 stories from 50 sources, ranked to 30, scored, and published by agents.
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink underline underline-offset-4 group-hover:text-graphite">
                Read today&apos;s edition <span aria-hidden>→</span>
              </p>
            </a>
          }
        />

        <section className="px-6 pb-16 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            {!lead ? (
              <>
                <SectionHead folio="Index" title="Nothing published yet." />
                <p className="mt-6 max-w-[48ch] text-[15px] leading-[1.6] text-graphite md:ml-[240px]">
                  A note appears here after it is published. The daily briefing stays on{" "}
                  <a href="/intel" className="text-ink underline underline-offset-4">
                    Intel
                  </a>
                  .
                </p>
              </>
            ) : (
              <>
                <SectionHead folio="Latest" title="The newest note." />
                <Link
                  to="/articles/$slug"
                  params={{ slug: lead.slug }}
                  className="group mt-8 grid border border-ink/80 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none md:grid-cols-[1.05fr_0.95fr]"
                >
                  <div className="hidden h-[320px] overflow-hidden border-ink/80 text-ink group-hover:text-background group-focus-visible:text-background md:block md:border-r">
                    <Motif kind="wideshot" />
                  </div>
                  <div className="flex flex-col justify-between gap-8 px-5 py-6 md:px-8 md:py-8">
                    <p
                      className={`${mono} text-graphite group-hover:text-background/70 group-focus-visible:text-background/70`}
                    >
                      {lead.publishedAt}
                    </p>
                    <div>
                      <h2 className="text-balance font-editorial text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95] tracking-tight">
                        {lead.title}
                      </h2>
                      {lead.dek ? (
                        <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.6] text-ink/80 group-hover:text-background/80 group-focus-visible:text-background/80">
                          {lead.dek}
                        </p>
                      ) : null}
                    </div>
                    <p className={`${mono} underline underline-offset-4`}>
                      Read the note <span aria-hidden>→</span>
                    </p>
                  </div>
                </Link>

                {rest.length > 0 ? (
                  <div className="mt-14">
                    <SectionHead folio="Index" title="Also published." />
                    <ul className="mt-8 border-b border-ink/80 md:ml-[240px]">
                      {rest.map((article) => (
                        <li key={article.id} className="border-t border-ink/30">
                          <Link
                            to="/articles/$slug"
                            params={{ slug: article.slug }}
                            className="group grid grid-cols-1 gap-2 px-1 py-5 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none md:grid-cols-[8.5rem_minmax(0,0.9fr)_minmax(0,1.1fr)_auto] md:items-baseline md:gap-8"
                          >
                            <span
                              className={`${mono} text-graphite group-hover:text-background/70 group-focus-visible:text-background/70`}
                            >
                              {article.publishedAt}
                            </span>
                            <span className="font-editorial text-[26px] uppercase leading-[1] tracking-tight md:text-[30px]">
                              {article.title}
                            </span>
                            <span className="text-[14px] leading-[1.5] text-graphite group-hover:text-background/80 group-focus-visible:text-background/80">
                              {article.dek}
                            </span>
                            <span aria-hidden className="hidden font-mono text-[12px] md:block">
                              →
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
