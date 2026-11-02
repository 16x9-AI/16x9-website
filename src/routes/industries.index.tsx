import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbs, itemList, pageHead } from "@/lib/seo";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { CloseBand, PageFront, SectionHead, ServicesNav } from "@/components/site/Services";
import { INDUSTRY_GROUPS, INDUSTRY_PACKS } from "@/components/site/industries-data";

const DESCRIPTION =
  "Accounting, capital advisory, wealth management, insurance, mortgage and business lending, medical practices, real estate, property management, field services, law, engineering, agencies, staffing, manufacturing, logistics and managed IT. What AI takes off each team's plate.";

export const Route = createFileRoute("/industries/")({
  head: () =>
    pageHead({
      title: "AI for accounting, healthcare, real estate and 15 more industries | 16x9",
      description: DESCRIPTION,
      path: "/industries",
      jsonLd: [
        itemList(INDUSTRY_PACKS.map((p) => ({ name: p.name, path: `/industries/${p.key}` }))),
        breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
        ]),
      ],
    }),
  component: IndustriesPage,
});

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

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
              Every business has the same work behind each sale: forms, follow-up, matching, billing
              and reports, usually done by hand or sent to an outside team. Pick your line of work
              to see what that looks like for you, in your own terms.
            </p>
          }
          aside={
            <nav aria-label="Industry groups" className="self-start">
              <ul className="border-b border-ink/30">
                {INDUSTRY_GROUPS.map((g) => (
                  <li key={g} className="border-t border-ink/30">
                    <a
                      href={`#${g.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                      className="flex items-baseline justify-between py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:text-graphite focus-visible:underline focus-visible:outline-none"
                    >
                      {g}
                      <span className="text-graphite">
                        {INDUSTRY_PACKS.filter((p) => p.group === g).length}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          }
        />

        {INDUSTRY_GROUPS.map((g) => (
          <section
            key={g}
            id={g.toLowerCase().replace(/[^a-z]+/g, "-")}
            className="px-6 pb-14 md:px-10"
          >
            <div className="mx-auto max-w-[1400px]">
              <SectionHead folio="Industries" title={g} />
              <Reveal className="mt-8 md:ml-[240px]">
                <ul className="border-b border-ink/80">
                  {INDUSTRY_PACKS.filter((p) => p.group === g).map((p) => (
                    <li key={p.key} className="border-t border-ink/30">
                      <Link
                        to="/industries/$slug"
                        params={{ slug: p.key }}
                        className="group grid grid-cols-1 gap-1 px-1 py-5 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_auto] md:items-baseline md:gap-8"
                      >
                        <span className="font-editorial text-[26px] uppercase leading-[1] tracking-tight md:text-[30px]">
                          {p.name}
                        </span>
                        <span className="text-[15px] leading-[1.5]">{p.headline}</span>
                        <span aria-hidden className="hidden font-mono text-[12px] md:block">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        ))}

        <CloseBand
          title="Your trade is not on the list?"
          body="The test is the same everywhere: work that follows a checklist and arrives as email, documents or spreadsheets. Tell us what your team does all day."
          subject="Our industry"
        />
      </main>
      <Footer />
    </>
  );
}
