import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { getArticles } from "@/lib/linkedin/queue";
import { breadcrumbs, pageHead } from "@/lib/seo";

const loadArticles = createServerFn({ method: "GET" }).handler(async () => getArticles());

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
  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-6 py-16 text-ink">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">Intel</p>
        <h1 className="mt-2 font-editorial text-5xl">Articles</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-ink/80">
          Sourced notes from the research desk. The daily briefing stays on{" "}
          <a href="/intel">Intel</a>.
        </p>
        {articles.length === 0 ? (
          <p className="mt-10 text-sm text-graphite">No articles published yet.</p>
        ) : (
          <ul className="mt-10 grid gap-8">
            {articles.map((article) => (
              <li key={article.id} className="border-t border-ink/15 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                  {article.publishedAt}
                </p>
                <h2 className="mt-2 font-editorial text-3xl">
                  <Link
                    to="/articles/$slug"
                    params={{ slug: article.slug }}
                    className="hover:text-ink/70"
                  >
                    {article.title}
                  </Link>
                </h2>
                {article.dek ? (
                  <p className="mt-2 text-sm leading-6 text-ink/80">{article.dek}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
