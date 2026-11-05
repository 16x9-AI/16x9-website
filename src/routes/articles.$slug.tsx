import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { paragraphs } from "@/lib/linkedin/articles";
import { getArticle } from "@/lib/linkedin/queue";
import { breadcrumbs, pageHead } from "@/lib/seo";

const loadArticle = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data }) => getArticle(data));

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const article = await loadArticle({ data: params.slug });
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) =>
    pageHead({
      title: `${loaderData?.title ?? "Article"} | 16x9`,
      description: loaderData?.dek || "A sourced note from the 16x9 research desk.",
      path: `/articles/${loaderData?.slug ?? ""}`,
      jsonLd: [
        breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Articles", path: "/articles" },
          { name: loaderData?.title ?? "Article", path: `/articles/${loaderData?.slug ?? ""}` },
        ]),
        {
          "@type": "Article",
          headline: loaderData?.title,
          datePublished: loaderData?.publishedAt,
          description: loaderData?.dek,
        },
      ],
    }),
  component: ArticlePage,
  notFoundComponent: ArticleMissing,
});

function sourceHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ArticlePage() {
  const article = Route.useLoaderData();
  const blocks = paragraphs(article.body);

  return (
    <>
      <Nav />
      <main>
        <article className="px-6 pb-16 pt-10 md:px-10 md:pt-14">
          <div className="mx-auto max-w-[1400px]">
            <p className={`${mono} text-graphite`}>
              <Link
                to="/articles"
                className="underline-offset-4 hover:text-ink hover:underline focus-visible:underline focus-visible:outline-none"
              >
                Articles
              </Link>
              <span> / {article.publishedAt}</span>
            </p>
            <h1 className="mt-5 max-w-[18ch] text-balance font-editorial text-[clamp(2.6rem,6.2vw,5.25rem)] uppercase leading-[0.92] tracking-[-0.01em]">
              {article.title}
            </h1>
            {article.dek ? (
              <p className="mt-6 max-w-[46ch] text-[18px] leading-[1.55] text-ink md:text-[20px]">
                {article.dek}
              </p>
            ) : null}

            <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink/80 pt-8 lg:grid-cols-[220px_minmax(0,68ch)] lg:gap-16">
              <div className="order-1 lg:order-2">
                <div className="grid gap-6 text-[17px] leading-[1.75] text-ink md:text-[18px]">
                  {blocks.map((paragraph, index) => (
                    <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                  ))}
                </div>
                <p className="mt-12 border-t border-ink/80 pt-4">
                  <Link
                    to="/articles"
                    className={`${mono} text-ink underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none`}
                  >
                    All articles <span aria-hidden>→</span>
                  </Link>
                </p>
              </div>
              <aside className="order-2 lg:order-1">
                <p className={`${mono} text-graphite`}>Sources</p>
                <ul className="mt-3 border-b border-ink/30">
                  {article.sources.map((source) => (
                    <li key={source.url} className="border-t border-ink/30 py-3">
                      <a
                        href={source.url}
                        rel="noreferrer"
                        className="text-[14px] leading-snug text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-none"
                      >
                        {source.name}
                      </a>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite">
                        {sourceHost(source.url)}
                      </p>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function ArticleMissing() {
  return (
    <>
      <Nav />
      <main className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <p className={`${mono} text-graphite`}>Articles</p>
          <h1 className="mt-4 max-w-[16ch] font-editorial text-[clamp(2.4rem,6vw,4.5rem)] uppercase leading-[0.92] tracking-tight">
            This article is not published.
          </h1>
          <p className="mt-8">
            <Link
              to="/articles"
              className={`${mono} text-ink underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none`}
            >
              All articles <span aria-hidden>→</span>
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
