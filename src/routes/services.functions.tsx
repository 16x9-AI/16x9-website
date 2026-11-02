import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import {
  CloseBand,
  FunctionLedger,
  PageFront,
  SectionHead,
  ServicesNav,
} from "@/components/site/Services";
import { LEVELS, PEOPLE_LEAD } from "@/components/site/services-data";

const TITLE = "Functions | 16x9";
const DESCRIPTION =
  "The business functions agents take on: payables, receivables, close, intake, service desk, scheduling, reporting, research, sales development, marketing, recruiting, compliance, procurement and IT. What a person keeps, and what already runs.";

export const Route = createFileRoute("/services/functions")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://16x9.ai/services/functions" },
    ],
    links: [{ rel: "canonical", href: "https://16x9.ai/services/functions" }],
  }),
  component: FunctionsPage,
});

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

// The five tests every function is ranked by. Sequence carries no meaning; they are read together.
const TESTS = [
  { h: "Volume", body: "The same work, many times a day." },
  { h: "Rules", body: "A checklist or a policy decides most cases." },
  { h: "Digital inputs", body: "It arrives as email, PDFs or rows in a system." },
  { h: "Checkable", body: "The answer can be checked against a source." },
  { h: "A gate", body: "A mistake can be caught before it does harm." },
];

const assist = LEVELS.find((l) => l.key === "assist");

function FunctionsPage() {
  return (
    <>
      <Nav />
      <ServicesNav />
      <main>
        <PageFront
          title="The work agents take on."
          lede={
            <p>
              Most companies run on the same back office: invoices, inboxes, documents, schedules,
              reports and follow-up. Here is each function we move onto agents, the tasks inside it,
              and what a person keeps. Where it already runs in one of our own companies, we say so.
            </p>
          }
          aside={
            <dl className="grid grid-cols-2 gap-x-6 self-start sm:grid-cols-5">
              {TESTS.map((t) => (
                <div key={t.h} className="border-t border-ink/80 py-3">
                  <dt className={`${mono} text-ink`}>{t.h}</dt>
                  <dd className="mt-1.5 text-[13px] leading-[1.5] text-graphite">{t.body}</dd>
                </div>
              ))}
            </dl>
          }
        />

        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <FunctionLedger />
          </div>
        </section>

        {/* Level three: what we do not automate */}
        <section className="bg-obsidian px-6 py-12 text-snow md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Level three" title={assist?.name} tone="dark">
              {assist?.line} We say this out loud because it is the work people want to keep, and
              the work a company is trusted for.
            </SectionHead>
            <Reveal className="mt-10">
              <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 md:ml-[240px]">
                {PEOPLE_LEAD.map((p) => (
                  <li
                    key={p}
                    className="border-t border-snow/30 py-4 font-editorial text-[26px] uppercase leading-[1] tracking-tight text-snow"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <p className="mt-10 font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-snow/60 md:ml-[240px]">
              &ldquo;In our companies&rdquo; reuses the audited statuses on the{" "}
              <Link
                to="/"
                hash="work"
                className="text-snow underline underline-offset-4 hover:text-snow/70"
              >
                work board
              </Link>
              , Q3 2026. Running: in use today. Pilot: proven in a first run. Building: not yet
              relied on.
            </p>
          </div>
        </section>

        <CloseBand
          title="Pick the function that costs you most."
          body="Tell us which of these your team spends the most hours on. The assessment measures it as it runs today, then ranks what moving it onto agents does for margin."
          subject="An opportunity assessment"
        />
      </main>
      <Footer />
    </>
  );
}
