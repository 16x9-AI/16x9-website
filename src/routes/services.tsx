import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Motif } from "@/components/site/Motif";
import {
  EngagementPath,
  IndustryIndex,
  SectionHead,
  StartSentence,
} from "@/components/site/Services";
import { FUNCTIONS, MAIL, OUTCOMES, SAMPLE, STEPS, mailto } from "@/components/site/services-data";

const TITLE = "Services | 16x9";
const DESCRIPTION =
  "Forward-deployed engineers and operators move a company's back office onto agents. Start with a fixed-fee opportunity assessment, or partner for equity or a share of revenue.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://16x9.ai/services" },
    ],
    links: [{ rel: "canonical", href: "https://16x9.ai/services" }],
  }),
  component: ServicesPage,
});

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

function ServicesPage() {
  return (
    <>
      <Nav />
      <main>
        {/* The front: what the page is about, and the sentence the reader completes */}
        <section className="px-6 pb-12 pt-10 md:px-10 md:pt-14">
          <div className="mx-auto max-w-[1400px]">
            <h1 className="max-w-[24ch] text-balance font-editorial text-[clamp(2.75rem,7vw,6rem)] uppercase leading-[0.9] tracking-[-0.01em] text-ink">
              Agentic operations, deployed inside the company.
            </h1>
            <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink/80 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <p className="max-w-[52ch] text-[17px] leading-[1.6] text-ink md:text-[18px]">
                Software can now do much of the work behind each sale: answering requests, reviewing
                documents, scheduling, billing, the monthly reports. Our engineers and operators
                work inside your company and move that work onto agents, so each customer costs less
                to serve and the team can take on more without hiring at the same pace.
              </p>
              <div className="hidden aspect-[3/1] w-full overflow-hidden border border-ink/80 text-ink sm:block">
                <Motif kind="filmstrip" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Where we start" title="Tell us where the hours go." />
            <Reveal className="mt-10">
              <StartSentence />
            </Reveal>
          </div>
        </section>

        {/* The engagements, in full */}
        <section id="engagements" className="bg-obsidian px-6 py-12 text-snow md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Engagements" title="Five ways in." tone="dark">
              Ordered by how much of the company we take on. Prices are set in scoping, after the
              first conversation, and the scope names every person and firm on the work and what
              each is paid before you sign.
            </SectionHead>
            <Reveal className="mt-10">
              <EngagementPath detailed />
            </Reveal>
          </div>
        </section>

        {/* What moves first */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Functions" title="The work that moves first.">
              Work that follows a checklist, repeats every day, and lives in email, spreadsheets and
              an old system of record. Agents take the volume. People keep the exceptions and the
              decisions.
            </SectionHead>
            <dl className="mt-10 grid grid-cols-1 gap-x-10 border-b border-ink/80 sm:grid-cols-2 lg:grid-cols-3">
              {FUNCTIONS.map((f) => (
                <div key={f.key} className="border-t border-ink/30 py-5">
                  <dt className="text-[17px] font-medium leading-snug text-ink">{f.name}</dt>
                  <dd className="mt-1.5 text-[14px] leading-[1.6] text-graphite">{f.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* How the work runs, then the sample */}
        <section className="px-6 pb-12 md:px-10 md:pb-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="How it runs" title="Measured before, measured after." />
            <ol className="mt-10 grid grid-cols-1 border-b border-ink/80 md:grid-cols-5">
              {STEPS.map((s) => (
                <li
                  key={s.when}
                  className="border-t border-ink/30 py-5 md:border-l md:border-t-0 md:px-5 md:py-2 md:first:border-l-0 md:first:pl-0"
                >
                  <p className="font-editorial text-[24px] uppercase leading-none tracking-tight text-ink">
                    {s.when}
                  </p>
                  <p className="mt-3 text-[14px] leading-[1.6] text-ink">{s.body}</p>
                </li>
              ))}
            </ol>

            <Reveal className="mt-14 border border-ink/80">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/80 bg-ink px-5 py-3 text-background md:px-6">
                <h3 className="font-editorial text-[26px] uppercase leading-none tracking-tight">
                  A sample build plan
                </h3>
                <p className={`${mono} text-background/75`}>{SAMPLE.label}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.2fr]">
                <div className="border-b border-ink/30 px-5 py-5 md:px-6 lg:border-b-0 lg:border-r">
                  <p className={`${mono} text-graphite`}>The company</p>
                  <p className="mt-3 text-[15px] leading-[1.6] text-ink">{SAMPLE.company}</p>
                </div>
                <div className="border-b border-ink/30 px-5 py-5 md:px-6 lg:border-b-0 lg:border-r">
                  <p className={`${mono} text-graphite`}>Measured in the assessment</p>
                  <ul className="mt-3">
                    {SAMPLE.measured.map((m) => (
                      <li
                        key={m}
                        className="border-t border-ink/20 py-2 text-[14px] leading-snug text-ink first:border-t-0"
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-5 py-5 md:px-6">
                  <p className={`${mono} text-graphite`}>Built first</p>
                  <ul className="mt-3">
                    {SAMPLE.build.map((b) => (
                      <li
                        key={b}
                        className="border-t border-ink/20 py-2 text-[14px] leading-[1.55] text-ink first:border-t-0"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="border-t border-ink/80 px-5 py-4 text-[14px] leading-[1.6] text-ink md:px-6">
                <span className={`${mono} mr-3 text-graphite`}>The result</span>
                {SAMPLE.result}
              </p>
            </Reveal>
          </div>
        </section>

        {/* What it does for the company */}
        <section className="bg-obsidian px-6 py-12 text-snow md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Outcomes" title="What it changes beyond cost." tone="dark" />
            <dl className="mt-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-5">
              {OUTCOMES.map((o) => (
                <div key={o.h} className="border-t border-snow/30 py-5">
                  <dt className="font-editorial text-[24px] uppercase leading-[1] tracking-tight text-snow">
                    {o.h}
                  </dt>
                  <dd className="mt-3 text-[14px] leading-[1.6] text-snow/80">{o.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Industries" title="Where we work." />
            <Reveal className="mt-10">
              <IndustryIndex />
            </Reveal>
          </div>
        </section>

        {/* Who does the work, and the operator door */}
        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="border-t border-ink/80 pt-4">
              <p className={`${mono} text-graphite`}>Who does the work</p>
              <h2 className="mt-4 font-editorial text-[clamp(2rem,3.6vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                People inside, agents underneath.
              </h2>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.65] text-ink">
                Forward-deployed engineers and operators from 16x9 work inside the company and
                answer for the scope. Mycel runs the agents: every run traced, every promotion
                signed off by a person. When a build needs more hands or a particular system,
                implementation firms from our network join, and the scope names them.
              </p>
            </div>
            <div className="border-t border-ink/80 pt-4">
              <p className={`${mono} text-graphite`}>Operators</p>
              <h2 className="mt-4 font-editorial text-[clamp(2rem,3.6vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                Know a trade? Lead the company.
              </h2>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.65] text-ink">
                We partner with founders, operators and owners who know an industry and its
                customers. You lead growth, product and sales. We build and run the machine. A
                community for these operators is forming now.
              </p>
              <a
                href={mailto("Operator partnership")}
                className="mt-6 inline-flex items-center gap-3 border border-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none"
              >
                Tell us the trade you know <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Close */}
        <section className="bg-ink px-6 py-14 text-background md:px-10 md:py-20">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
            <h2 className="text-balance font-editorial text-[clamp(2.5rem,5.5vw,4.5rem)] uppercase leading-[0.92] tracking-tight">
              Start with the assessment.
            </h2>
            <div>
              <p className="max-w-[48ch] text-[15px] leading-[1.65] text-background/85">
                Tell us about the company and the work your team spends the most hours on. The first
                conversation covers where agents would take the most off each contract.
              </p>
              <a
                href={mailto("An opportunity assessment")}
                className="mt-6 inline-flex items-center gap-3 bg-background px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-silver-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
              >
                {MAIL} <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
