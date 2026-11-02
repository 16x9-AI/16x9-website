import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { StatusDot } from "@/components/site/Board";
import { CloseBand, SectionHead, ServicesNav } from "@/components/site/Services";
import { INDUSTRY_PACKS, packByKey } from "@/components/site/industries-data";
import { FUNCTION_GROUPS } from "@/components/site/services-data";
import { getIndustryNotes, type IndustryNote } from "@/lib/industry-notes";

export const Route = createFileRoute("/industries/$slug")({
  loader: async ({ params }) => {
    const pack = packByKey(params.slug);
    if (!pack) throw notFound();
    // The notes read never blocks the page: on any failure it is null and the section hides.
    const notes = await getIndustryNotes({ data: pack.key }).catch(() => null);
    return { key: pack.key, notes };
  },
  head: ({ params }) => {
    const pack = packByKey(params.slug);
    const title = pack ? `${pack.name} | 16x9` : "Industries | 16x9";
    const description = pack ? `${pack.headline} ${pack.lede}` : "";
    const url = `https://16x9.ai/industries/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: IndustryPage,
});

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";
const groupName = (key: string) => FUNCTION_GROUPS.find((g) => g.key === key)?.name ?? key;

function IndustryPage() {
  const { key, notes } = Route.useLoaderData();
  const pack = packByKey(key)!;
  const others = INDUSTRY_PACKS.filter((p) => p.group === pack.group && p.key !== pack.key);

  return (
    <>
      <Nav />
      <ServicesNav />
      <main>
        <section className="px-6 pb-12 pt-10 md:px-10 md:pt-14">
          <div className="mx-auto max-w-[1400px]">
            <p className={`${mono} text-graphite`}>
              <Link to="/industries" className="underline-offset-4 hover:text-ink hover:underline">
                Industries
              </Link>{" "}
              / {pack.name}
            </p>
            <h1 className="mt-5 max-w-[22ch] text-balance font-editorial text-[clamp(2.5rem,6.4vw,5.5rem)] uppercase leading-[0.92] tracking-[-0.01em] text-ink">
              {pack.headline}
            </h1>
            <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink/80 pt-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
              <p className="max-w-[56ch] text-[17px] leading-[1.6] text-ink md:text-[18px]">
                {pack.lede}
              </p>
              <blockquote className="m-0 self-start border-l-0 bg-ink px-6 py-6 text-background md:px-8">
                <p className={`${mono} text-background/70`}>In plain terms</p>
                <p className="mt-3 font-editorial text-[clamp(1.5rem,2.6vw,2.1rem)] uppercase leading-[1.05] tracking-tight">
                  {pack.picture}
                </p>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Before and after: their chores, then what the AI takes on */}
        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Your week" title="What eats your team's week." />
            <div className="mt-10 grid grid-cols-1 gap-10 md:ml-[240px] lg:grid-cols-2 lg:gap-14">
              <div>
                <p className={`${mono} text-graphite`}>Today, by hand</p>
                <ul className="mt-3 border-b border-ink/30">
                  {pack.chores.map((c) => (
                    <li
                      key={c}
                      className="border-t border-ink/30 py-3 text-[16px] leading-snug text-ink"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={`${mono} text-graphite`}>What AI takes on</p>
                <ul className="mt-3 border-b border-ink/80">
                  {pack.tasks.map((t) => (
                    <li
                      key={t}
                      className="border-t border-ink/80 py-3 text-[16px] font-medium leading-snug text-ink"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[15px] leading-[1.6] text-ink">
                  <span className={`${mono} mr-2 text-graphite`}>Who signs off</span>
                  {pack.keeps}
                </p>
                {pack.note && <p className="mt-2 text-[14px] text-graphite">{pack.note}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* What we measure, and where we start */}
        <section className="bg-obsidian px-6 py-12 text-snow md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead
              folio="The first two weeks"
              title="We measure before we build."
              tone="dark"
            >
              The assessment starts with your own numbers. These are what we would measure. They are
              not promised results.
            </SectionHead>
            <div className="mt-10 grid grid-cols-1 gap-10 md:ml-[240px] lg:grid-cols-2 lg:gap-14">
              <ul className="border-b border-snow/30">
                {pack.measure.map((m) => (
                  <li
                    key={m}
                    className="border-t border-snow/30 py-3 font-editorial text-[24px] uppercase leading-[1.05] tracking-tight text-snow"
                  >
                    {m}
                  </li>
                ))}
              </ul>
              <div>
                <p className={`${mono} text-snow/60`}>Where we usually start</p>
                <ul className="mt-3">
                  {pack.first.map((k) => (
                    <li key={k} className="border-t border-snow/30">
                      <Link
                        to="/services/functions"
                        hash={k}
                        className="flex items-baseline justify-between px-1 py-3 text-[15px] font-medium text-snow transition-colors hover:bg-snow hover:text-obsidian focus-visible:bg-snow focus-visible:text-obsidian focus-visible:outline-none"
                      >
                        {groupName(k)}
                        <span aria-hidden className="font-mono text-[12px]">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {pack.proof && (
                  <div className="mt-8 border-t border-snow/30 pt-4">
                    <p className={`${mono} text-snow/60`}>We already run this ourselves</p>
                    <div className="mt-2">
                      <StatusDot status={pack.proof.status} />
                    </div>
                    <p className="mt-2 text-[14px] leading-[1.6] text-snow/85">{pack.proof.text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {notes && notes.length > 0 && <Notes name={pack.name} notes={notes} />}

        {others.length > 0 && (
          <section className="px-6 py-12 md:px-10">
            <div className="mx-auto max-w-[1400px]">
              <SectionHead folio={pack.group} title="Close to your line of work." />
              <ul className="mt-8 border-b border-ink/80 md:ml-[240px]">
                {others.map((o) => (
                  <li key={o.key} className="border-t border-ink/30">
                    <Link
                      to="/industries/$slug"
                      params={{ slug: o.key }}
                      className="group grid grid-cols-1 gap-1 px-1 py-4 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-baseline sm:gap-6"
                    >
                      <span className="font-editorial text-[24px] uppercase leading-none tracking-tight">
                        {o.name}
                      </span>
                      <span className="text-[14px] leading-[1.5] text-graphite group-hover:text-background/80 group-focus-visible:text-background/80">
                        {o.start}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <CloseBand
          title="Show us where the hours go."
          body="Tell us what your team spends the most time on. In two weeks we measure it and show you what AI can take off their plate, in your numbers."
          subject={`Assessment: ${pack.name}`}
        />
      </main>
      <Footer />
    </>
  );
}

/** Dated, sourced notes from the 16x9 intel desk. Rendered only when Mycel returns published rows. */
function Notes({ name, notes }: { name: string; notes: IndustryNote[] }) {
  return (
    <section className="px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead folio="This month" title={`What is changing for ${name.toLowerCase()}.`}>
          Short notes from public sources, each dated and linked to where it came from.
        </SectionHead>
        <ul className="mt-10 grid grid-cols-1 gap-x-10 md:ml-[240px] lg:grid-cols-3">
          {notes.map((n) => (
            <li key={n.url} className="border-t border-ink/80 py-5">
              <p className={`${mono} text-graphite`}>{n.date}</p>
              <h3 className="mt-2 text-[17px] font-medium leading-snug text-ink">{n.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink">{n.body}</p>
              <a
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className={`mt-3 inline-block ${mono} text-ink underline underline-offset-4 hover:text-graphite`}
              >
                {n.source}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
