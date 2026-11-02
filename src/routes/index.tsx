import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import { MycelBrain } from "@/components/site/MycelBrain";
import { Contact } from "@/components/site/Contact";
import { Motif } from "@/components/site/Motif";
import { CountUp } from "@/components/site/CountUp";
import {
  BoardColumn,
  BoardRow,
  type BoardColumnData,
  type BoardRowData,
  type Status,
} from "@/components/site/Board";
import { EngagementPath, IndustryIndex, SectionHead, Splice } from "@/components/site/Services";
import { MAIL, mailto } from "@/components/site/services-data";

export const Route = createFileRoute("/")({
  component: Index,
});

// Who we work with. One door per reader, second person, one sentence, one subject line,
// so the first email already says who is writing.
const doors = [
  {
    label: "Owners",
    text: "Your company runs on old systems or an outsourced back office, and the margin should be higher.",
    subject: "An opportunity assessment",
  },
  {
    label: "Operators and founders",
    text: "You know a trade and its customers. You want to build or lead a company that runs on agents.",
    subject: "Operator partnership",
  },
  {
    label: "Holding companies and investors",
    text: "You own several companies and want one operating layer under all of them.",
    subject: "Portfolio operations",
  },
  {
    label: "Brokers and advisers",
    text: "You see the companies first. Bring us the ones that should run leaner before they sell.",
    subject: "Broker introduction",
  },
  {
    label: "Builders",
    text: "You build agents and want to work at this level. Send what you have shipped.",
    subject: "Working at 16x9",
  },
];

// The board. Companies are described by industry, never by name (VOICE.md,
// decision 2026-09-02). Every status audited against Linear closed issues,
// the Mycel 16x9 universe, and the Vercel project list on 2026-09-02.
// Three rows per column; the rest lives in the column's `also` line.
// Outcome budget: two lines at 13px in a ~246px column (about 80 characters).
const board: BoardColumnData[] = [
  {
    industry: "Clinical research",
    context: "A site network and a sponsored-research network beside it.",
    motif: "dots",
    rows: [
      {
        status: "Running",
        name: "Sponsor development",
        outcome: "Scans the public trial registry, scores sponsor fit, shortlists targets.",
      },
      {
        status: "Pilot",
        name: "Sponsored-research platform",
        outcome:
          "Conversational onboarding, registry trial supply, a PHI filter in code. One practice live.",
      },
      {
        status: "Pilot",
        name: "Document agents",
        outcome:
          "Read, OCR, rename, and file the shared drive. Each move is written to a ledger first.",
      },
    ],
    also: "Building: receivables and trial-agreement billing, each line behind a gate verdict.",
  },
  {
    industry: "Capital advisory",
    context: "M&A, debt, and real-estate advisory firms on one intelligence layer.",
    motif: "field",
    rows: [
      {
        status: "Running",
        name: "Intelligence engine",
        outcome:
          "SEC filings and news daily. Six credibility axes, an adversarial pass, forecasts scored against outcomes.",
      },
      {
        status: "Running",
        name: "Public risk desk",
        outcome: "Footnoted notes: jurisdiction pulses, license clocks, ownership-opacity flags.",
      },
      {
        status: "Running",
        name: "Firm operating system",
        outcome: "Six skills, three agents, four tables. CLI install, shipped August 2026.",
      },
    ],
    also: "Also running: twelve sector primers, a data-backed public site. Building: finance runners, a pre-call audit.",
  },
  {
    industry: "Commercial lending",
    context: "Businesses matched to capital, no hard credit pull first.",
    motif: "filmstrip",
    rows: [
      {
        status: "Running",
        name: "Compliance-gated content engine",
        outcome:
          "Topics by vertical and product, drafts tied to a source registry. The gate blocks unsourced claims before anything publishes.",
      },
      {
        status: "Running",
        name: "Signal collectors",
        outcome:
          "Federal Register and global-event feeds open reactive drafts, disaster-relief financing among them.",
      },
      {
        status: "Building",
        name: "Lender-network integration",
        outcome: "Prequalification, application submission, consent built for TCPA.",
      },
    ],
  },
  {
    industry: "Real estate",
    context: "An agentic operating platform for property operators. Early.",
    motif: "waves",
    rows: [
      {
        status: "Running",
        name: "Tenant applications",
        outcome: "New leads become applications in the property system. Live since June 2026.",
      },
      {
        status: "Building",
        name: "Vendor discovery",
        outcome: "Listing scraping, validation, enrichment, then an outreach coordinator.",
      },
      {
        status: "Building",
        name: "Investment screening",
        outcome: "Scores an opportunity layer by layer and writes scorecards to tables.",
      },
    ],
  },
  {
    industry: "Field services",
    context: "A nationwide commercial and government cleaning company.",
    motif: "contours",
    rows: [
      {
        status: "Running",
        name: "Self-publishing website",
        outcome: "154 location pages served as HTML. A blog by five agents behind quality gates.",
      },
      {
        status: "Running",
        name: "B2B targeting engine",
        outcome: "Miami-Dade: who to call, why now, who decides, how to reach them.",
      },
      {
        status: "Building",
        name: "Back office on agents",
        outcome:
          "Cleaner assignment and operations first. HR and accounting underway. A dispute agent in test.",
      },
    ],
  },
];

const practice = [
  { label: "Build", body: "Products, and the companies they live in. We stay after launch." },
  {
    label: "Operate",
    body: "Agents take on daily work: research, publishing, intake, reporting. People own the decisions the agents surface.",
  },
  {
    label: "Research",
    body: "A standing share of every quarter goes to capability we do not have yet.",
  },
];

// Systems that belong to the studio rather than to one company. Same status rules as the board.
const studioRows: BoardRowData[] = [
  {
    status: "Running",
    name: "Delivery pipeline",
    outcome:
      "Agents take a ticket, implement it, verify against the live system, and close with evidence. People review the pull requests.",
  },
  {
    status: "Building",
    name: "Accounting platform",
    outcome:
      "US GAAP close, a reconciliation queue, period locks, bookkeeping sync, on an open-source ERP core. Operational beta.",
  },
  {
    status: "Building",
    name: "Paper-trading desk",
    outcome: "Gradient-boosted alpha factors, regime detection, transaction-cost modeling.",
  },
];

// Counts pulled from the Mycel catalog on 2026-09-02 and rounded down:
// 649 skills, 1,214 tool integrations, 84 agents, 93 connection environments.
const mycelSpecs = [
  {
    label: "Composition",
    value: "Agents from versioned skills, tools, rules, guardrails, and triggers.",
  },
  { label: "Catalog", value: "600+ skills, 1,000+ tool integrations, 80+ agents." },
  {
    label: "Models",
    value:
      "Multiple providers through one gateway. Pick a policy: auto, cost-effective, high-quality.",
  },
  { label: "Memory", value: "Episodic recall, document library, cache. Three privacy tiers." },
  { label: "Trust", value: "Each block earns 0 to 9 from clean runs. Human sign-off above 5." },
  { label: "Learning", value: "Every run graded. Proposed changes wait for sign-off." },
  { label: "Tenancy", value: "Firms share building blocks across a market, never private data." },
  { label: "Surfaces", value: "Web app, MCP server, REST API, editor harness." },
];

// The running head is computed from the data above, so it can never drift from the board.
function tally(rows: { status: Status }[]) {
  const t: Record<Status, number> = { Running: 0, Pilot: 0, Building: 0 };
  for (const r of rows) t[r.status] += 1;
  return t;
}
const counts = tally([...board.flatMap((c) => c.rows), ...studioRows, { status: "Running" }]);
const marqueeItems = [
  <>
    <CountUp value={counts.Running} /> running
  </>,
  <>
    <CountUp value={counts.Pilot} /> pilot
  </>,
  <>
    <CountUp value={counts.Building} /> building
  </>,
  "audited Q3 2026",
];

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";
const focusRow = "focus-visible:outline-none focus-visible:bg-ink/[0.04]";

function Index() {
  return (
    <>
      <Nav />
      <main>
        {/* Frame 1: the front page */}
        <section className="px-6 pb-6 pt-10 md:px-10 md:pt-14">
          <div className="mx-auto w-full max-w-[1400px]">
            <h1 className="max-w-[24ch] text-balance font-editorial text-[clamp(2.75rem,7vw,6rem)] uppercase leading-[0.9] tracking-[-0.01em] text-ink">
              We build agentic companies with the people who know the trade.
            </h1>

            <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink/80 pt-8 md:grid-cols-2 lg:grid-cols-[0.95fr_1.45fr_0.8fr] lg:gap-10">
              <Reveal className="md:flex md:h-full md:flex-col">
                <p className="max-w-[44ch] text-[17px] leading-[1.6] text-ink md:text-[18px]">
                  You bring the trade, the customers and the distribution. We bring forward-deployed
                  engineers and operators, and Mycel, the orchestration system we built to run the
                  work. We partner for equity or a share of revenue, and we stay to run it.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 md:mt-auto md:pt-8">
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-3 bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background transition-colors hover:bg-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    How we work <span aria-hidden>→</span>
                  </Link>
                  <a
                    href={`mailto:${MAIL}`}
                    className="inline-flex items-center border border-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none"
                  >
                    {MAIL}
                  </a>
                </div>
              </Reveal>

              <Reveal
                delay={0.06}
                className="md:col-span-2 md:row-start-2 lg:col-span-1 lg:row-start-auto"
              >
                <Splice />
              </Reveal>

              <Reveal
                delay={0.12}
                className="md:col-start-2 md:row-start-1 lg:col-start-auto lg:row-start-auto"
              >
                <a href="/intel" className={`group block ${focusRow}`}>
                  <div className="hidden aspect-video w-full overflow-hidden border border-ink/80 text-ink sm:block">
                    <Motif kind="lines" />
                  </div>
                  <p className="mt-3 text-[14px] font-medium leading-snug text-ink">
                    Daily AI-industry report
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[1.5] text-graphite">
                    About 1,800 stories from 50 sources, ranked to 30, scored, and published by
                    agents every morning.
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink underline underline-offset-4 group-hover:text-graphite">
                    Today&apos;s edition <span aria-hidden>→</span>
                  </p>
                </a>
              </Reveal>
            </div>

            <div className="mt-8 hidden border-t border-ink/30 sm:block">
              <div className="mt-3 h-10 w-full text-ink md:h-12">
                <Motif kind="horizon" />
              </div>
            </div>
          </div>
        </section>

        <Marquee items={marqueeItems} />

        {/* Frame 2: the ways in, on the dark plate */}
        <section id="services" className="bg-obsidian px-6 py-10 text-snow md:px-10 md:py-14">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Services" title="Five ways in." tone="dark">
              Start with a measured assessment, or start as partners. Each step leaves the company
              with something it keeps. No prices here: each one is set in scoping.
            </SectionHead>
            <Reveal className="mt-10">
              <EngagementPath />
            </Reveal>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-snow/60">
              <Link
                to="/services"
                className="text-snow underline underline-offset-4 hover:text-snow/70"
              >
                What each engagement contains, and a sample build plan
              </Link>{" "}
              <span aria-hidden>→</span>
            </p>
          </div>
        </section>

        {/* Frame 3: who it is for */}
        <section id="industries" className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Industries" title="Companies that run on a back office.">
              The candidates are companies where people still do most of the work behind each sale:
              the paperwork, the follow-up, the matching and the reports. That work goes first.
            </SectionHead>
            <Reveal className="mt-10">
              <IndustryIndex />
            </Reveal>
          </div>
        </section>

        {/* Frame 4: the proof, what already runs */}
        <section id="work" className="bg-obsidian px-6 py-10 text-snow md:px-10 md:py-14">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Proof" title="What runs in our own companies." tone="dark">
              We build on ourselves first. Audited Q3 2026.
            </SectionHead>
            <p className="mt-6 font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-snow/60 md:ml-[240px]">
              Running: in use today. Pilot: proven in a first run, not yet in daily use. Building:
              not yet relied on.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {board.map((col, i) => (
                <Reveal key={col.industry} delay={i * 0.04} className="flex">
                  <BoardColumn col={col} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Frame 5: the studio and the platform, one plate */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.95fr_0.75fr_1.1fr] lg:gap-10">
              <Reveal id="studio" className="border-t border-ink/80 pt-4">
                <p className={`${mono} text-graphite`}>The studio</p>
                <h2 className="mt-4 font-editorial text-[30px] uppercase leading-[1.02] tracking-tight text-ink md:text-[34px]">
                  Across industries on purpose.
                </h2>
                <p className="mt-4 text-[15px] leading-[1.65] text-ink">
                  A pattern solved in one company shows up in the next. The daily intelligence
                  report built for the AI industry now runs a second edition on clinical research.
                  Outreach, newsletter, and campaign-reporting agents are built once and shared
                  across companies, some still building.
                </p>
                <dl className="mt-6 border-t border-ink/80">
                  {practice.map((p) => (
                    <div
                      key={p.label}
                      className="grid grid-cols-[92px_1fr] gap-4 border-b border-ink/30 py-3"
                    >
                      <dt className={`${mono} text-graphite`}>{p.label}</dt>
                      <dd className="text-[13.5px] leading-[1.55] text-ink">{p.body}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={0.06} className="flex flex-col">
                <figure className="m-0">
                  <div className="aspect-video w-full overflow-hidden border border-ink/80 bg-obsidian text-snow">
                    <Motif kind="wideshot" />
                  </div>
                  <figcaption className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-graphite">
                    Fig. 01. 16:9, the aspect ratio of a wide shot.
                  </figcaption>
                </figure>
                <div className="mt-6 hidden aspect-video w-full overflow-hidden border border-ink/80 bg-obsidian sm:block lg:aspect-auto lg:h-[420px]">
                  <div className="h-full w-full invert">
                    <MycelBrain />
                  </div>
                </div>
              </Reveal>

              <Reveal id="mycel" delay={0.12} className="border-t border-ink/80 pt-4">
                <p className={`${mono} text-graphite`}>The platform</p>
                <h2 className="mt-4 font-editorial text-[clamp(2rem,4vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                  Mycel
                </h2>
                <p className="mt-4 text-[15px] leading-[1.65] text-ink">
                  The orchestration system we build engagements on, and the one our companies are
                  moving onto. Internal: the people who build with us build on it, and it is not
                  open beyond that.
                </p>
                <dl className="mt-6 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  {mycelSpecs.map((s) => (
                    <div key={s.label} className="border-t border-ink/80 pb-4 pt-3">
                      <dt className={`${mono} text-graphite`}>{s.label}</dt>
                      <dd className="mt-1 text-[12.5px] leading-[1.5] text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="border-t border-ink/80" />
                <p className="mt-2 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-graphite">
                  Counts from the platform catalog, Q3 2026, rounded down.
                </p>
              </Reveal>
            </div>

            <div className="mt-12 border-t border-ink/80 pt-4">
              <p className={`${mono} text-graphite`}>Across the studio</p>
              <ul
                className="mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-3"
                aria-label="Systems across the studio"
              >
                {studioRows.map((r) => (
                  <BoardRow key={r.name} row={r} tone="light" />
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Frame 6: contact, one door per reader */}
        <section id="contact" className="px-6 pb-14 pt-4 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Contact" title="Talk to us." />
            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <ul aria-label="Who we work with" className="border-b border-ink/80">
                {doors.map((d) => (
                  <li key={d.label} className="border-t border-ink/30">
                    <a
                      href={mailto(d.subject)}
                      className="group grid grid-cols-1 gap-1 px-1 py-4 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none sm:grid-cols-[220px_1fr_auto] sm:items-baseline sm:gap-6"
                    >
                      <span
                        className={`${mono} text-graphite group-hover:text-background/70 group-focus-visible:text-background/70`}
                      >
                        {d.label}
                      </span>
                      <span className="text-[15px] leading-[1.5]">{d.text}</span>
                      <span aria-hidden className="hidden font-mono text-[12px] sm:block">
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <Reveal>
                <Contact />
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
