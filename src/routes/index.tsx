import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import { MycelBrain } from "@/components/site/MycelBrain";
import { Contact } from "@/components/site/Contact";
import { Ledger, type LedgerGroup } from "@/components/site/Ledger";
import heroHorizon from "@/assets/art/hero-horizon.svg";

export const Route = createFileRoute("/")({
  component: Index,
});

// The record. Audited against Linear (closed issues, all teams) and the Mycel
// 16x9 universe on 2026-09-02. Companies are described by industry, never
// named (VOICE.md). Status values: running = in use today; pilot = live with a
// first cohort; building = in progress, not yet relied on.
const record: LedgerGroup[] = [
  {
    industry: "Clinical research",
    context: "A Southwest Florida research site network, and a sponsored-research network being built beside it.",
    rows: [
      {
        name: "Sponsor development machine",
        detail:
          "Scans the public trial registry, scores sponsor fit against the network's therapeutic areas, and shortlists targets for the team.",
        status: "running",
      },
      {
        name: "Operations moving onto agents",
        detail:
          "Function by function. Receivables and clinical-trial-agreement billing first, with a gate verdict on every line item before it is sent.",
        status: "building",
      },
      {
        name: "Document agents",
        detail:
          "Read, OCR, rename, and file the network's shared drive. Proven on a dry run; every move is written to a ledger before it happens.",
        status: "pilot",
      },
      {
        name: "Sponsored-research platform",
        detail:
          "Conversational site onboarding backed by a live model, trial supply from the public registry, one sign-in, and a code-level filter that keeps patient detail out of every free-text answer.",
        status: "pilot",
      },
      {
        name: "Daily clinical-research report",
        detail: "Researched, written, and published every morning without a hand on it.",
        status: "running",
      },
    ],
  },
  {
    industry: "Capital advisory",
    context: "A network for independent M&A, debt, and real-estate advisory firms, sharing one intelligence layer.",
    rows: [
      {
        name: "Intelligence engine",
        detail:
          "Evidence pulled daily from SEC filings and global news through a 200-source registry, scored on six credibility axes, verified with an adversarial pass, and held in a forecast ledger that is recalibrated against what actually happened.",
        status: "running",
      },
      {
        name: "Public risk desk",
        detail:
          "Priority intelligence requirements published as verified notes with footnoted sources. Jurisdiction pulses, license clocks, ownership-opacity flags.",
        status: "running",
      },
      {
        name: "Sector primers",
        detail:
          "Twelve finance-firm types mapped from how they operate today to a fully agentic end state, and what closes the gap.",
        status: "running",
      },
      {
        name: "Firm operating system",
        detail:
          "Skills, agents, and tables an advisory shop runs engagements, asks, offers, and campaigns on. Six skills, three agents, four tables, one command-line install.",
        status: "running",
      },
      {
        name: "Finance runners",
        detail:
          "Reconciliation, month-end close, statements, variance analysis, audit support, KYC screening, and model building, each as a governed agent.",
        status: "building",
      },
      {
        name: "Public site",
        detail: "Rebuilt as a data-backed front end on the platform. What the desk knows is what the site shows.",
        status: "running",
      },
    ],
  },
  {
    industry: "Commercial lending",
    context: "A financing marketplace that matches businesses to capital without touching their credit score first.",
    rows: [
      {
        name: "Content engine with a compliance gate",
        detail:
          "Topics chosen at the intersection of vertical and product, drafts grounded in a source registry, and a gate that blocks anything ungrounded before it publishes.",
        status: "running",
      },
      {
        name: "Signal collectors",
        detail: "Federal registers and global news feed the reactive content path. Disaster-relief financing drafts within hours of a declaration.",
        status: "running",
      },
      {
        name: "Lender-network integration",
        detail:
          "Agent prequalification, application submission, and status sync into the lender network, with consent and suppression records designed against TCPA.",
        status: "building",
      },
    ],
  },
  {
    industry: "Real estate",
    context: "An agentic operating platform for property operators. Early.",
    rows: [
      {
        name: "Tenant-application automation",
        detail: "New leads become property applications in the management system without a person in the loop.",
        status: "running",
      },
      {
        name: "Vendor discovery and outreach",
        detail: "Local service vendors found, validated, and enriched from public maps; outreach coordinated cache-first.",
        status: "building",
      },
      {
        name: "Investment screening",
        detail: "Scores an opportunity layer by layer and writes the scorecard to tables the team can query.",
        status: "building",
      },
    ],
  },
  {
    industry: "Field services",
    context: "A nationwide commercial and government cleaning company.",
    rows: [
      {
        name: "Self-publishing website",
        detail:
          "150+ location pages served as real HTML, and a blog researched, composed, audited, graded, and challenged by five agents. Quality gates decide what ships. People decide what the gates check.",
        status: "running",
      },
      {
        name: "B2B targeting engine",
        detail: "Who to call in Miami-Dade, why now, who decides, and how to reach them.",
        status: "running",
      },
      {
        name: "Back office on agents",
        detail:
          "Cleaner assignment and operations first. HR and accounting underway. A dispute agent that opens chargeback trackers is in test.",
        status: "building",
      },
    ],
  },
  {
    industry: "Across the studio",
    context: "Systems every company inherits.",
    rows: [
      {
        name: "Daily AI intelligence report",
        detail: (
          <>
            Roughly 1,800 stories from 50 sources each morning, ranked to 30, scored, and published. Public at{" "}
            <a href="/intel" className="underline underline-offset-4 hover:text-snow">
              /intel
            </a>
            .
          </>
        ),
        status: "running",
      },
      {
        name: "Delivery pipeline",
        detail:
          "Agents that take a ticket, implement it in the repo, verify against the live system, and close it with evidence. Humans review the pull request.",
        status: "running",
      },
      {
        name: "Accounting platform",
        detail: "US GAAP close, reconciliation queue, period locks, and QuickBooks sync, on an open-source ERP core.",
        status: "building",
      },
      {
        name: "Paper-trading desk",
        detail: "Gradient-boosted alpha factors, regime detection, transaction-cost modeling. Paper only.",
        status: "building",
      },
    ],
  },
];

// Counts pulled from the Mycel catalog on 2026-09-02 and rounded down:
// 649 skills, 1,214 tool integrations, 84 agents, 93 connection environments.
const mycelSpecs = [
  { label: "Composition", value: "Agents built from versioned skills, tools, rules, and guardrails" },
  { label: "Catalog", value: "600+ skills, 1,000+ tool integrations, shared across firms" },
  { label: "Models", value: "Multiple providers through one gateway. Pick a policy, not a vendor" },
  { label: "Memory", value: "Episodic recall, document library, cache. Three privacy tiers" },
  { label: "Trust", value: "Every block earns a 0 to 9 readiness level from clean runs" },
  { label: "Learning", value: "Runs are graded. Improvements are proposed. People sign off" },
  { label: "Access", value: "Web app, MCP server, REST API, editor harness" },
  { label: "Status", value: "Internal. In use across our companies. Not open yet" },
];

const habits = [
  "Nothing publishes without a gate. A person decides what the gate checks.",
  "Every agent run leaves a trace. If we cannot read why it did something, it does not run in production.",
  "Trust is earned per component, from clean runs. It is never declared.",
  "Status is printed as it is: running, pilot, building.",
  "We read the field every morning and publish what we read.",
];

function Index() {
  return (
    <>
      <Nav />
      <main>
        {/* Statement */}
        <section className="flex min-h-[calc(100dvh-8rem)] flex-col justify-between px-6 pb-10 pt-14 md:px-10 md:pt-20">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
              16x9 / AI studio
            </p>
            <h1 className="mt-8 font-editorial text-[clamp(2.75rem,9vw,8.5rem)] uppercase leading-[0.92] tracking-tight text-ink">
              We build agentic systems.
              <br />
              Then we run them.
            </h1>
            <p className="mt-8 max-w-2xl text-[16px] leading-[1.7] text-ink md:text-[18px]">
              Inside clinical research networks, advisory firms, lenders, property operators, and
              field-services companies. Built and operated on Mycel, the agent platform we made for
              it.
            </p>
            <p className="mt-6 max-w-xl font-mono text-[12px] uppercase leading-relaxed tracking-[0.08em] text-graphite">
              Open to partners, founders, and builders.{" "}
              <a href="#contact" className="text-ink underline underline-offset-4 hover:text-graphite">
                Write to us
              </a>
              .
            </p>
          </div>
          <div className="mx-auto mt-14 w-full max-w-[1400px] border-t border-ink/30">
            <img
              src={heroHorizon}
              alt=""
              aria-hidden
              className="mt-6 h-28 w-full object-cover md:h-40"
            />
          </div>
        </section>

        <Marquee />

        {/* The record */}
        <section id="work" className="bg-obsidian px-6 py-24 text-snow md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.34fr_1fr] md:gap-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-snow/60">
                The record
              </p>
              <div>
                <h2 className="max-w-[20ch] font-editorial text-[clamp(2.25rem,6vw,5rem)] uppercase leading-[0.95] tracking-tight text-snow">
                  What is built, what it does, where it stands.
                </h2>
                <p className="mt-6 max-w-[56ch] text-[15px] leading-[1.7] text-snow/80 md:text-[16px]">
                  Described by industry. Names on request. Status is audited against our own
                  tracker before it is printed here.
                </p>
              </div>
            </div>
            <div className="mt-14 md:mt-16">
              <Ledger groups={record} />
            </div>
          </div>
        </section>

        {/* Mycel */}
        <section id="mycel" className="border-t border-snow/20 bg-obsidian px-6 py-20 text-snow md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 items-stretch gap-14 md:grid-cols-[0.42fr_0.58fr] md:gap-16">
              <Reveal className="aspect-[16/9] w-full overflow-hidden border border-snow/20 md:aspect-auto md:h-full md:w-auto">
                <div className="h-full w-full invert">
                  <MycelBrain />
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-snow/60">
                  Mycel / The platform
                </p>
                <h2 className="mt-7 font-editorial text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-tight text-snow">
                  Mycel
                </h2>
                <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.7] text-snow md:text-[17px]">
                  The agent platform the record above runs on. We built it to compose agents from
                  inspectable parts, run them on the model that fits, give them memory, and hold
                  them to a standard of trust that is earned rather than declared.
                </p>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-snow/80">
                  An agent is a versioned composition: skills, tools, rules, guardrails, triggers.
                  Each block starts untrusted. Clean runs move it up a 0 to 9 readiness ladder.
                  Past the midpoint, nothing advances without a person signing off. Every run is
                  traced and graded, and the platform proposes the next improvement for a human to
                  accept or reject. Firms share what works across a common market without sharing
                  what is private.
                </p>
                <dl className="mt-10 divide-y divide-snow/20 border-t border-snow/20">
                  {mycelSpecs.map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-6 py-5">
                      <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-snow/60">
                        {row.label}
                      </dt>
                      <dd className="max-w-[34ch] text-right font-mono text-[12px] uppercase tracking-[0.06em] text-snow">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-6 py-5">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-snow/60">
                      Details
                    </dt>
                    <dd>
                      <Link
                        to="/mycel"
                        className="font-mono text-[12px] uppercase tracking-[0.06em] text-snow underline underline-offset-4 hover:text-snow/70"
                      >
                        Read more about Mycel →
                      </Link>
                    </dd>
                  </div>
                </dl>
                {/* Legal copy tied to Google OAuth verification. Ships verbatim. See VOICE.md. */}
                <p className="mt-8 max-w-[52ch] font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-snow/50">
                  Mycel connects to Google on your behalf for sign-in and basic Workspace directory
                  information only, not Gmail, Calendar, or Drive content.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* How we work */}
        <section id="how" className="border-b border-ink/80 px-6 py-20 md:px-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 md:grid-cols-[0.34fr_1fr] md:gap-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
              How we work
            </p>
            <Reveal>
              <ol className="divide-y divide-ink/20 border-t border-ink/80">
                {habits.map((h) => (
                  <li
                    key={h}
                    className="py-6 font-editorial text-[22px] leading-[1.15] tracking-tight text-ink md:text-[28px]"
                  >
                    {h}
                  </li>
                ))}
              </ol>
              <p className="mt-8 max-w-[52ch] text-[15px] leading-[1.7] text-graphite">
                The people are builders, founders, and entrepreneurs. Some of us run the companies
                above. We work across industries on purpose: a pattern solved in one shows up in
                the next, and generalists notice.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="px-6 py-20 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
              Contact
            </p>
            <h2 className="mt-8 max-w-[18ch] font-editorial text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
              Talk to us.
            </h2>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.7] text-ink md:text-[17px]">
              If you run a company that should be running on agents, have a business worth
              building, or want to work with people who ship at this level, write to us. We read
              everything ourselves.
            </p>
            <div className="mt-16 md:mt-20">
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
