import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Motif } from "@/components/site/Motif";
import { CloseBand, PageFront, ServicesNav } from "@/components/site/Services";
import { FUNCTION_GROUPS, INDUSTRY_PACKS } from "@/components/site/services-data";

const TITLE = "Industries | 16x9";
const DESCRIPTION =
  "Manufacturing, medical practices, accounting, engineering, insurance, mortgage lending, real estate brokerage, managed IT, and any company with an outsourced back office. The work that moves onto agents first in each.";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://16x9.ai/industries" },
    ],
    links: [{ rel: "canonical", href: "https://16x9.ai/industries" }],
  }),
  component: IndustriesPage,
});

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";
const groupName = (key: string) => FUNCTION_GROUPS.find((g) => g.key === key)?.name ?? key;

function IndustriesPage() {
  return (
    <>
      <Nav />
      <ServicesNav />
      <main>
        <PageFront
          title="Different trades, the same back office."
          lede={
            <p>
              The industry changes the vocabulary, not the work. Behind every sale sits intake,
              paperwork, follow-up, matching and reports, usually done by hand or sent to an outside
              team. Pick your trade to see what moves onto agents first.
            </p>
          }
          aside={
            <nav aria-label="Industries" className="self-start">
              <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {INDUSTRY_PACKS.map((p) => (
                  <li key={p.key} className="border-t border-ink/30">
                    <a
                      href={`#${p.key}`}
                      className="flex items-baseline justify-between py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:text-graphite focus-visible:underline focus-visible:outline-none"
                    >
                      {p.name}
                      <span aria-hidden className="text-ink/50">
                        ↓
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          }
        />

        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto max-w-[1400px] border-b border-ink/80">
            {INDUSTRY_PACKS.map((p) => (
              <Reveal key={p.key}>
                <article
                  id={p.key}
                  aria-labelledby={`${p.key}-h`}
                  className="grid grid-cols-1 gap-6 border-t border-ink/80 py-8 md:grid-cols-[1.2fr_1fr] md:gap-10"
                >
                  <div>
                    <h2
                      id={`${p.key}-h`}
                      className="text-balance font-editorial text-[clamp(2rem,3.8vw,3rem)] uppercase leading-[0.95] tracking-tight text-ink"
                    >
                      {p.name}
                    </h2>
                    <ul className="mt-5">
                      {p.tasks.map((t) => (
                        <li
                          key={t}
                          className="border-t border-ink/20 py-2 text-[15px] leading-snug text-ink first:border-t-0"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                    {p.note && <p className="mt-3 text-[13.5px] text-graphite">{p.note}</p>}
                  </div>
                  <div>
                    <p className={`${mono} text-graphite`}>Where we start</p>
                    <ul className="mt-3">
                      {p.first.map((k) => (
                        <li key={k} className="border-t border-ink/30">
                          <Link
                            to="/services/functions"
                            hash={k}
                            className="flex items-baseline justify-between px-1 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none"
                          >
                            {groupName(k)}
                            <span aria-hidden className="font-mono text-[12px]">
                              →
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mx-auto mt-10 hidden h-12 max-w-[1400px] text-ink sm:block">
            <Motif kind="horizon" />
          </div>
        </section>

        <CloseBand
          title="Your trade is not on the list?"
          body="The test is the same everywhere: work that follows a checklist and arrives as email, documents or rows in a system. Tell us what your team does all day."
          subject="Our industry"
        />
      </main>
      <Footer />
    </>
  );
}
