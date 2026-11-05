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

function ArticlePage() {
  const article = Route.useLoaderData();
  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-6 py-16 text-ink">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          {article.publishedAt}
        </p>
        <h1 className="mt-3 font-editorial text-5xl leading-tight">{article.title}</h1>
        {article.dek ? <p className="mt-4 text-lg leading-7 text-ink/80">{article.dek}</p> : null}
        <div className="mt-8 grid gap-5 text-base leading-7">
          {paragraphs(article.body).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        <ul className="mt-10 grid gap-2 border-t border-ink/15 pt-6 text-sm">
          {article.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} className="underline underline-offset-4">
                {source.name}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <Link
            to="/articles"
            className="font-mono text-[11px] uppercase tracking-[0.14em] underline underline-offset-4"
          >
            All articles
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}

function ArticleMissing() {
  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[50vh] max-w-3xl px-6 py-16 text-ink">
        <h1 className="font-editorial text-4xl">This article is not published.</h1>
        <p className="mt-4">
          <Link to="/articles" className="underline underline-offset-4">
            All articles
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
