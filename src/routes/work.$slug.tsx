import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { BoardRow } from "@/components/site/Board";
import { CloseBand, SectionHead } from "@/components/site/Services";
import { CASE_STUDIES, caseByKey } from "@/components/site/work-data";
import { packByKey } from "@/components/site/industries-data";
import { breadcrumbs, clampDescription, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    if (!caseByKey(params.slug)) throw notFound();
    return { key: params.slug };
  },
  head: ({ params }) => {
    const c = caseByKey(params.slug);
    if (!c)
      return { meta: [{ title: "Not found | 16x9" }, { name: "robots", content: "noindex" }] };
    const path = `/work/${c.key}`;
    const description = clampDescription(`${c.headline} ${c.startingPoint}`);
    return pageHead({
      title: `Case study: AI in ${c.industry.toLowerCase()} | 16x9`,
      description,
      path,
      jsonLd: [
        {
          "@type": "Article",
          headline: c.headline,
          description,
          url: `https://16x9.ai${path}`,
          about: c.industry,
          author: { "@id": "https://16x9.ai/#organization" },
          publisher: { "@id": "https://16x9.ai/#organization" },
          dateModified: "2026-11-02",
        },
        breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Work", path: "/#work" },
          { name: c.industry, path },
        ]),
      ],
    });
  },
  component: CasePage,
});

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

function CasePage() {
  const { key } = Route.useLoaderData();
  const c = caseByKey(key)!;
  const pack = c.industryKey ? packByKey(c.industryKey) : undefined;
  const others = CASE_STUDIES.filter((o) => o.key !== c.key);

  return (
    <>
      <Nav />
      <main>
        <section className="px-6 pb-12 pt-10 md:px-10 md:pt-14">
          <div className="mx-auto max-w-[1400px]">
            <p className={`${mono} text-graphite`}>
              <a href="/#work" className="underline-offset-4 hover:text-ink hover:underline">
                What we run
              </a>{" "}
              / {c.industry}
            </p>
            <h1 className="mt-5 max-w-[24ch] text-balance font-editorial text-[clamp(2.4rem,6vw,5.25rem)] uppercase leading-[0.92] tracking-[-0.01em] text-ink">
              {c.headline}
            </h1>
            <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink/80 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
              <div>
                <p className={`${mono} text-graphite`}>Where it started</p>
                <p className="mt-3 max-w-[60ch] text-[17px] leading-[1.6] text-ink md:text-[18px]">
                  {c.startingPoint}
                </p>
                <p className="mt-4 text-[14px] text-graphite">
                  {c.oneLine} A company 16x9 runs. Its name is kept off this site.
                </p>
              </div>
              {c.numbers && c.numbers.length > 0 && (
                <dl className="self-start border-t border-ink/80">
                  {c.numbers.map((n) => (
                    // dt before dd for screen readers; flex-row-reverse shows the number first.
                    <div
                      key={n.label}
                      className="flex flex-row-reverse items-baseline justify-end gap-5 border-b border-ink/30 py-4"
                    >
                      <dt className="text-[14px] leading-snug text-ink">{n.label}</dt>
                      <dd className="min-w-[4ch] font-editorial text-[48px] leading-none text-ink">
                        {n.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </section>

        <section className="bg-obsidian px-6 py-12 text-snow md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead
              folio="What we built"
              title="What runs today, and what is still being built."
              tone="dark"
            >
              Running: in use today. Pilot: proven in a first run, not yet in daily use. Building:
              not yet relied on.
            </SectionHead>
            <ul className="mt-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {c.built.map((b) => (
                <BoardRow
                  key={b.name}
                  row={{ status: b.status, name: b.name, outcome: b.what }}
                  heading="h3"
                />
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead
              folio="How it runs"
              title="From the source of the work to the person who signs off."
            />
            <Reveal className="mt-10">
              <ol className="grid grid-cols-1 border-b border-ink/80 md:grid-cols-2 lg:grid-cols-3">
                {c.howItRuns.map((step, i) => (
                  <li
                    key={step}
                    className="grid grid-cols-[48px_1fr] gap-3 border-t border-ink/30 py-5 pr-6"
                  >
                    <span className="font-editorial text-[36px] leading-none text-ink">
                      {i + 1}
                    </span>
                    <span className="text-[15px] leading-[1.6] text-ink">{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="border-t border-ink/80 pt-4">
              <h2 className="font-editorial text-[clamp(2rem,3.6vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                What people still decide
              </h2>
              <ul className="mt-5 border-b border-ink/30">
                {c.peopleDecide.map((p) => (
                  <li
                    key={p}
                    className="border-t border-ink/30 py-3 text-[16px] leading-snug text-ink"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-ink/80 pt-4">
              <h2 className="font-editorial text-[clamp(2rem,3.6vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                What comes next
              </h2>
              <ul className="mt-5 border-b border-ink/30">
                {c.next.map((n) => (
                  <li
                    key={n}
                    className="border-t border-ink/30 py-3 text-[16px] leading-snug text-ink"
                  >
                    {n}
                  </li>
                ))}
              </ul>
              {c.caveat && (
                <p className="mt-4 text-[14px] leading-[1.6] text-graphite">{c.caveat}</p>
              )}
            </div>
          </div>
        </section>

        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Read next" title="Use it in your business." />
            <ul className="mt-8 border-b border-ink/80 md:ml-[240px]">
              {pack && (
                <li className="border-t border-ink/30">
                  <Link
                    to="/industries/$slug"
                    params={{ slug: pack.key }}
                    className="flex items-baseline justify-between gap-6 px-1 py-4 text-[16px] font-medium text-ink transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none"
                  >
                    What AI takes on for {pack.name.toLowerCase()} <span aria-hidden>→</span>
                  </Link>
                </li>
              )}
              <li className="border-t border-ink/30">
                <Link
                  to="/scorecard"
                  className="flex items-baseline justify-between gap-6 px-1 py-4 text-[16px] font-medium text-ink transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none"
                >
                  Score where AI fits in your business, in two minutes <span aria-hidden>→</span>
                </Link>
              </li>
              {others.map((o) => (
                <li key={o.key} className="border-t border-ink/30">
                  <Link
                    to="/work/$slug"
                    params={{ slug: o.key }}
                    className="flex items-baseline justify-between gap-6 px-1 py-4 text-[16px] text-ink transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none"
                  >
                    Case study: {o.industry.toLowerCase()} <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CloseBand
          title="We run this ourselves. We can run it for you."
          body="Tell us what your company does and where the hours go. The first conversation is about your work, not our software."
          subject={`Case study: ${c.industry}`}
        />
      </main>
      <Footer />
    </>
  );
}
