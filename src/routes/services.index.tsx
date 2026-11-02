import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Motif } from "@/components/site/Motif";
import {
  EngagementPath,
  LevelSummary,
  SectionHead,
  ServicesNav,
  Splice,
  StartSentence,
} from "@/components/site/Services";
import { MAIL, OUTCOMES, SAMPLE, STEPS, mailto } from "@/components/site/services-data";

const TITLE = "Services | 16x9";
const DESCRIPTION =
  "Forward-deployed engineers and operators move a company's back office onto agents. Start with a fixed-fee opportunity assessment, or partner for equity or a share of revenue.";

export const Route = createFileRoute("/services/")({
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

const MORE = [
  {
    to: "/services/functions" as const,
    label: "Functions",
    text: "Every function we move onto agents, what a person keeps, and what already runs in our own companies.",
  },
  {
    to: "/industries" as const,
    label: "Industries",
    text: "Nine industries and the work that moves first in each.",
  },
  {
    to: "/partners" as const,
    label: "Partners",
    text: "Know a trade? Build the company with us, for equity or a share of revenue.",
  },
];

function ServicesPage() {
  return (
    <>
      <Nav />
      <ServicesNav />
      <main>
        {/* The front */}
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

        {/* The model: both sides of the partnership */}
        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="The model" title="Two sides, one company.">
              You bring the trade, the customers and the distribution. We bring forward-deployed
              engineers and operators, and Mycel, the orchestration system we built to run the work.
            </SectionHead>
            <Reveal className="mt-10 lg:ml-[240px]">
              <Splice />
            </Reveal>
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

        {/* The engagements */}
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

        {/* What agents take on, in three levels */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Functions" title="What agents take on.">
              Ranked by five tests: how much volume, how clear the rules, whether the inputs are
              already digital, whether the answer can be checked against a source, and whether a
              mistake can be caught before it does harm.
            </SectionHead>
            <Reveal className="mt-10">
              <LevelSummary />
            </Reveal>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
              <Link
                to="/services/functions"
                className="underline underline-offset-4 hover:text-graphite"
              >
                Every function, task by task
              </Link>{" "}
              <span aria-hidden>→</span>
            </p>
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

        {/* Who does the work, and where to read next */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="border-t border-ink/80 pt-4">
              <h2 className="font-editorial text-[clamp(2rem,3.6vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                People inside, agents underneath.
              </h2>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.65] text-ink">
                Forward-deployed engineers and operators from 16x9 work inside the company and
                answer for the scope. Mycel runs the agents: every run traced, every promotion
                signed off by a person. When a build needs more hands or a particular system,
                implementation firms from our network join, and the scope names them.
              </p>
            </div>
            <ul aria-label="Read next" className="border-b border-ink/80">
              {MORE.map((m) => (
                <li key={m.to} className="border-t border-ink/80">
                  <Link
                    to={m.to}
                    className="group grid grid-cols-1 gap-1 px-1 py-4 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none sm:grid-cols-[140px_1fr_auto] sm:items-baseline sm:gap-6"
                  >
                    <span className="font-editorial text-[24px] uppercase leading-none tracking-tight">
                      {m.label}
                    </span>
                    <span className="text-[14px] leading-[1.5]">{m.text}</span>
                    <span aria-hidden className="hidden font-mono text-[12px] sm:block">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
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
