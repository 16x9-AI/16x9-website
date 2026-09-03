import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import { MycelBrain } from "@/components/site/MycelBrain";
import { Contact } from "@/components/site/Contact";
import { BoardColumn, BoardRow, StatusDot, type BoardColumnData, type BoardRowData } from "@/components/site/Board";
import heroHorizon from "@/assets/art/hero-horizon.svg";
import philosophyDiagram from "@/assets/art/philosophy-diagram.svg";
import artAgentField from "@/assets/art/exp-01-agent-field-services.svg";
import artContentDerivatives from "@/assets/art/exp-02-content-derivatives.svg";
import artDealIntelligence from "@/assets/art/exp-03-deal-intelligence.svg";
import artOutreachSystems from "@/assets/art/exp-04-outreach-systems.svg";
import artNewsletter from "@/assets/art/exp-05-newsletter-intelligence.svg";
import artWebsiteGen from "@/assets/art/exp-06-website-generation.svg";

export const Route = createFileRoute("/")({
  component: Index,
});

// Who we work with. One row per audience, one sentence each, one anchor.
const audiences = [
  {
    label: "Clients",
    text: "Companies that should be running on agents. Operations move over one function at a time, behind gates a person sets.",
    href: "#work",
  },
  {
    label: "Partners",
    text: "Firms and co-builders. Systems already running, a platform to run them on, and a standing research allocation.",
    href: "#studio",
  },
  {
    label: "Builders",
    text: "You build on the platform the companies run on. What you ship earns its trust run by run.",
    href: "#mycel",
  },
  {
    label: "Business owners",
    text: "Some of us run the companies described here. If you have a business worth building, we build it and run it with you.",
    href: "#contact",
  },
];

// The board. Companies are described by industry, never by name (VOICE.md,
// decision 2026-09-02). Every status audited against Linear closed issues,
// the Mycel 16x9 universe, and the Vercel project list on 2026-09-02.
// Outcome budget: two lines at 13px in a ~246px column (about 80 characters).
const board: BoardColumnData[] = [
  {
    industry: "Clinical research",
    context: "A site network and a sponsored-research network beside it.",
    art: artAgentField,
    rows: [
      { status: "Running", name: "Sponsor development", outcome: "Scans the public trial registry, scores sponsor fit, shortlists targets." },
      { status: "Pilot", name: "Sponsored-research platform", outcome: "Conversational onboarding, registry trial supply, a patient-detail filter in code. One practice live." },
      { status: "Pilot", name: "Document agents", outcome: "Read, OCR, rename, and file the shared drive. Each move is written to a ledger first." },
      { status: "Building", name: "Operations on agents", outcome: "Function by function. Each billing line clears a gate verdict first." },
    ],
    also: "Also running: a clinical-research intelligence report, every morning.",
  },
  {
    industry: "Capital advisory",
    context: "M&A, debt, and real-estate advisory firms on one intelligence layer.",
    art: artDealIntelligence,
    rows: [
      { status: "Running", name: "Intelligence engine", outcome: "SEC filings and news daily. Six credibility axes, an adversarial pass, forecasts scored against outcomes." },
      { status: "Running", name: "Public risk desk", outcome: "Footnoted notes: jurisdiction pulses, license clocks, ownership-opacity flags." },
      { status: "Running", name: "Firm operating system", outcome: "Six skills, three agents, four tables. Command-line install. Shipped August 2026." },
      { status: "Building", name: "Finance runners", outcome: "Reconciliation, close, statements, variance, audit support, KYC screening." },
    ],
    also: "Also running: twelve sector primers, a data-backed public site. Building: a pre-call audit.",
  },
  {
    industry: "Commercial lending",
    context: "A financing marketplace: businesses matched to capital, no hard credit pull first.",
    art: artContentDerivatives,
    rows: [
      { status: "Running", name: "Compliance-gated content engine", outcome: "Topics by vertical and product, drafts grounded in a source registry. The gate blocks ungrounded claims before publish." },
      { status: "Running", name: "Regulatory collectors", outcome: "Federal Register and global-event feeds open reactive drafts, disaster-relief financing among them." },
      { status: "Building", name: "Lender-network integration", outcome: "Agent prequalification, application submission, consent designed against TCPA." },
    ],
  },
  {
    industry: "Real estate",
    context: "An agentic operating platform for property operators. Early.",
    art: artOutreachSystems,
    rows: [
      { status: "Running", name: "Tenant applications", outcome: "New leads become applications in the property management system. Live since June 2026." },
      { status: "Building", name: "Vendor discovery", outcome: "Listing scraping, validation, enrichment, then an outreach coordinator." },
      { status: "Building", name: "Investment screening", outcome: "Scores an opportunity layer by layer and writes scorecards to tables." },
    ],
  },
  {
    industry: "Field services",
    context: "A nationwide commercial and government cleaning company.",
    art: artWebsiteGen,
    rows: [
      { status: "Running", name: "Self-publishing website", outcome: "154 location pages as real HTML. A blog by five agents behind quality gates." },
      { status: "Running", name: "B2B targeting engine", outcome: "Miami-Dade: who to call, why now, who decides, how to reach them." },
      { status: "Building", name: "Back office on agents", outcome: "Cleaner assignment and operations first. HR and accounting underway." },
    ],
    also: "Also building: a dispute agent that opens chargeback trackers, in test.",
  },
];

const practice = [
  { label: "Build", body: "Products, and the companies they live in. We stay after launch, so the work has to hold up past the demo." },
  { label: "Operate", body: "Agents take on daily work: research, publishing, intake, reporting. People own the decisions the agents surface." },
  { label: "Research", body: "A standing share of every quarter goes to capability we do not have yet." },
];

// Systems built once and shared by every company. Same status rules as the board.
const studioRows: BoardRowData[] = [
  { status: "Running", name: "Delivery pipeline", outcome: "Agents take a ticket, implement it, verify against the live system, and close with evidence. People review the pull requests." },
  { status: "Building", name: "Accounting platform", outcome: "US GAAP close, a reconciliation queue, period locks, bookkeeping sync, on an open-source ERP core. Operational beta." },
  { status: "Building", name: "Paper-trading desk", outcome: "Gradient-boosted alpha factors, regime detection, transaction-cost modeling. Paper only." },
];

// Counts pulled from the Mycel catalog on 2026-09-02 and rounded down:
// 649 skills, 1,214 tool integrations, 84 agents, 93 connection environments.
const mycelSpecs = [
  { label: "Composition", value: "Agents from versioned skills, tools, rules, guardrails, and triggers." },
  { label: "Catalog", value: "600+ skills, 1,000+ tool integrations, 80+ agents, shared across firms." },
  { label: "Models", value: "Multiple providers through one gateway. Pick a policy, not a vendor." },
  { label: "Memory", value: "Episodic recall, document library, cache. Three privacy tiers." },
  { label: "Trust", value: "Each block earns 0 to 9 from clean runs. Human sign-off above 5." },
  { label: "Learning", value: "Every run graded. Improvements proposed. People sign off." },
  { label: "Tenancy", value: "Firms share building blocks across a market, never private data." },
  { label: "Access", value: "Web app, MCP server, REST API, editor harness." },
];

const habits = [
  "Nothing publishes without a gate. A person decides what the gate checks.",
  "Every agent run leaves a trace.",
  "Trust is earned per component from clean runs, never declared.",
  "Status is printed as it is: running, pilot, building.",
  "We read the field every morning and publish what we read.",
];

const kicker = "font-mono text-[11px] uppercase tracking-[0.16em]";

function Index() {
  return (
    <>
      <Nav />
      <main>
        {/* Frame 1: the front page */}
        <section className="px-6 pb-8 pt-10 md:px-10 md:pt-12">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className={`${kicker} text-graphite`}>16x9 / AI studio</p>
            <h1 className="mt-5 font-editorial text-[clamp(2.5rem,6.4vw,5.75rem)] uppercase leading-[0.92] tracking-tight text-ink">
              We build agentic companies
              <br />
              and run them.
            </h1>

            <div className="mt-8 grid grid-cols-1 gap-10 border-t border-ink/80 pt-8 md:grid-cols-[1.15fr_1fr_0.95fr] md:gap-12">
              <Reveal>
                <p className="max-w-[46ch] text-[16px] leading-[1.65] text-ink md:text-[17px]">
                  An AI studio. Founders and entrepreneurs who build agentic systems and run them
                  inside the companies behind the work below. Some of us run those companies. We
                  stay after launch. We also build for outside partners. The work runs on Mycel,
                  the agent platform we built.
                </p>
                <p className="mt-6 font-mono text-[12px] uppercase leading-relaxed tracking-[0.08em] text-graphite">
                  Clients, partners, founders, builders: write to{" "}
                  <a href="mailto:info@16x9.ai" className="text-ink underline underline-offset-4 hover:text-graphite">
                    info@16x9.ai
                  </a>
                </p>
              </Reveal>

              <Reveal delay={0.06}>
                <p className={`${kicker} text-graphite`}>Who we work with</p>
                <ul className="mt-3">
                  {audiences.map((a) => (
                    <li key={a.label} className="border-t border-ink/30">
                      <a href={a.href} className="group block py-3 hover:bg-ink/[0.03]">
                        <span className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                          <span>{a.label}</span>
                          <span aria-hidden className="text-ink/50 group-hover:text-ink">→</span>
                        </span>
                        <span className="mt-1 block text-[13.5px] leading-[1.5] text-ink">{a.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.12}>
                <p className={`${kicker} text-graphite`}>Proof, today</p>
                <a href="/intel" className="group mt-3 block">
                  <div className="aspect-video w-full overflow-hidden border border-ink/80">
                    <img src={artNewsletter} alt="" aria-hidden className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-3">
                    <StatusDot status="Running" tone="light" />
                  </div>
                  <p className="mt-1.5 text-[14px] font-medium leading-snug text-ink">Daily AI-industry report</p>
                  <p className="mt-1 text-[13.5px] leading-[1.5] text-graphite">
                    About 1,800 stories from about 50 sources every morning, ranked to about 30, scored,
                    and published by agents.
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink underline underline-offset-4 group-hover:text-graphite">
                    Read today's edition at /intel →
                  </p>
                </a>
              </Reveal>
            </div>

            <div className="mt-8 border-t border-ink/30">
              <img src={heroHorizon} alt="" aria-hidden className="mt-4 h-16 w-full object-cover md:h-20" />
            </div>
          </div>
        </section>

        <Marquee />

        {/* Frame 2: the board */}
        <section id="work" className="bg-obsidian px-6 py-10 text-snow md:px-10 md:py-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <p className={`${kicker} text-snow/60`}>#1 Work</p>
                <h2 className="mt-4 font-editorial text-[clamp(2.25rem,4.5vw,3.5rem)] uppercase leading-[0.95] tracking-tight text-snow">
                  Five industries. Status as printed.
                </h2>
                <p className="mt-3 max-w-[60ch] text-[13.5px] leading-[1.5] text-snow/75">
                  Inside the companies we build with, and for outside partners. Described by industry,
                  not by name. Audited September 2026.
                </p>
              </div>
              <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-snow/60 md:text-right">
                Running: in use today.
                <br />
                Pilot: live with a first cohort.
                <br />
                Building: not yet relied on.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {board.map((col, i) => (
                <Reveal key={col.industry} delay={i * 0.04} className="flex">
                  <BoardColumn col={col} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Frame 3: the studio and the platform, one plate */}
        <section className="border-t border-ink/80 px-6 py-12 md:px-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-[0.95fr_0.75fr_1.1fr] lg:gap-10">
            <Reveal id="studio">
              <p className={`${kicker} text-graphite`}>#2 The studio</p>
              <h2 className="mt-4 font-editorial text-[30px] uppercase leading-[1.02] tracking-tight text-ink md:text-[34px]">
                Across industries on purpose.
              </h2>
              <p className="mt-4 text-[15px] leading-[1.65] text-ink">
                A pattern solved in one company shows up in the next. The daily intelligence report
                built for the AI industry now runs a second edition on clinical research. Outreach,
                newsletter, and campaign-reporting agents are built once and shared across companies.
              </p>
              <dl className="mt-6 border-t border-ink/80">
                {practice.map((p) => (
                  <div key={p.label} className="grid grid-cols-[92px_1fr] gap-4 border-b border-ink/30 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">{p.label}</dt>
                    <dd className="text-[13.5px] leading-[1.55] text-ink">{p.body}</dd>
                  </div>
                ))}
              </dl>
              <p className={`${kicker} mt-6 text-graphite`}>Shared by every company</p>
              <ul className="mt-2">
                {studioRows.map((r) => (
                  <BoardRow key={r.name} row={r} tone="light" />
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.06} className="flex flex-col">
              <div className="aspect-video w-full overflow-hidden border border-ink/80">
                <img src={philosophyDiagram} alt="" aria-hidden className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-graphite">
                Fig. 01. 16:9, the aspect ratio of a wide shot.
              </p>
              <div className="mt-6 min-h-[380px] flex-1 overflow-hidden border border-ink/80">
                <MycelBrain />
              </div>
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-graphite">
                Fig. 02. Mycel as a network: memory, agents, data. Select a hub.
              </p>
            </Reveal>

            <Reveal id="mycel" delay={0.12}>
              <p className={`${kicker} text-graphite`}>#3 Mycel / The platform</p>
              <h2 className="mt-4 font-editorial text-[clamp(2rem,4vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                Mycel
              </h2>
              <p className="mt-4 text-[15px] leading-[1.65] text-ink">
                The agent platform our companies run on. Internal, not open. Agents are composed from
                versioned parts, every run is traced, and trust is earned per block from clean runs,
                never declared.
              </p>
              <dl className="mt-6 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {mycelSpecs.map((s) => (
                  <div key={s.label} className="border-t border-ink/80 pb-4 pt-3">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">{s.label}</dt>
                    <dd className="mt-1 text-[12.5px] leading-[1.5] text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-baseline justify-between border-t border-ink/80 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">Details</span>
                <Link to="/mycel" className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink underline underline-offset-4 hover:text-graphite">
                  Read more about Mycel →
                </Link>
              </div>
              <p className="mt-4 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-graphite">
                Counts from the platform catalog, September 2026, rounded down.
              </p>
              {/* Legal copy tied to Google OAuth verification. Ships verbatim. See VOICE.md. */}
              <p className="mt-2 max-w-[60ch] font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-graphite">
                Mycel connects to Google on your behalf for sign-in and basic Workspace directory
                information only, not Gmail, Calendar, or Drive content.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Frame 4: contact */}
        <section id="contact" className="border-t border-ink/80 px-6 py-12 md:px-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 md:grid-cols-[0.3fr_0.7fr] md:gap-16">
            <div>
              <p className={`${kicker} text-graphite`}>#4 Contact</p>
              <h2 className="mt-4 font-editorial text-[clamp(2rem,4vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                Talk to us.
              </h2>
              <p className="mt-3 text-[15px] leading-[1.6] text-ink">
                For clients, partners, founders, and builders. No form.
              </p>
              <p className={`${kicker} mt-8 text-graphite`}>How we work</p>
              <ul className="mt-2">
                {habits.map((h) => (
                  <li key={h} className="border-t border-ink/30 pt-3 pb-3 font-mono text-[12.5px] leading-relaxed text-graphite">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <Reveal>
              <Contact />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
