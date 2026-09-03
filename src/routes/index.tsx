import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import { FrameGrid, FrameCell } from "@/components/site/FrameGrid";
import { MycelBrain } from "@/components/site/MycelBrain";
import { Contact } from "@/components/site/Contact";
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

// Six systems, described by industry, never by company name (VOICE.md,
// decision 2026-09-02). Status audited against Linear closed issues, the Mycel
// 16x9 universe, and the Vercel project list on 2026-09-02.
const work = [
  {
    status: "Running",
    name: "Intelligence engine",
    outcome:
      "For advisory firms. Evidence pulled daily from SEC filings and global news, scored on six credibility axes, checked by an adversarial pass, and kept in a forecast ledger that is recalibrated against what actually happened.",
    art: artDealIntelligence,
  },
  {
    status: "Running",
    name: "Advisory operating layer",
    outcome:
      "A public risk desk that publishes verified notes with footnoted sources. Twelve sector primers, from how each finance-firm type works today to fully agentic. A firm operating system of skills, agents, and tables an advisory shop runs its engagements on.",
    art: artOutreachSystems,
  },
  {
    status: "Running",
    name: "Clinical research operations",
    outcome:
      "A site network's daily work moving onto agents. A sponsor-development machine scans the public trial registry and scores fit. Receivables and trial-agreement billing run behind a gate. Document agents read, rename, and file the shared drive.",
    art: artAgentField,
  },
  {
    status: "Pilot",
    name: "Sponsored-research platform",
    outcome:
      "Conversational site onboarding backed by a live model, trial supply from the public registry, one sign-in, and a code-level filter that keeps patient detail out of every free-text answer.",
    art: artContentDerivatives,
  },
  {
    status: "Running",
    name: "Self-publishing website",
    outcome:
      "For a nationwide cleaning company. 150+ location pages, and a blog researched, composed, audited, graded, and challenged by five agents. Quality gates decide what ships. The back office is moving onto agents next, function by function.",
    art: artWebsiteGen,
  },
  {
    status: "Running",
    name: "Daily intelligence",
    outcome: (
      <>
        Two reports every morning, one on the AI industry and one on clinical research.
        Researched, written, and published by agents. The first one is public at{" "}
        <a href="/intel" className="underline underline-offset-4 hover:text-snow">
          /intel
        </a>
        .
      </>
    ),
    art: artNewsletter,
  },
] as const;

const practice = [
  {
    label: "Build",
    body: "Products, and the companies they live in. We stay after launch, so the work has to hold up past the demo.",
  },
  {
    label: "Operate",
    body: "Agents take on daily work inside those companies: research, publishing, intake, reporting. People own the decisions the agents surface.",
  },
  {
    label: "Research",
    body: "A standing share of every quarter goes to capability we do not have yet. Some of it becomes product. The rest becomes judgment.",
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

function Index() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="flex min-h-[calc(100dvh-8rem)] flex-col justify-between px-6 pb-10 pt-14 md:px-10 md:pt-20">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
              16x9 / AI studio
            </p>
            <h1 className="mt-8 font-editorial text-[clamp(2.75rem,10vw,9.5rem)] uppercase leading-[0.92] tracking-tight text-ink">
              We build
              <br />
              agentic companies.
            </h1>
            <p className="mt-8 max-w-2xl text-[16px] leading-[1.7] text-ink md:text-[18px]">
              Builders, founders, and entrepreneurs working across clinical research, capital
              advisory, commercial lending, real estate, and field services. Every company we work
              in is moving its operations onto Mycel, the agent platform we built.
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

        {/* How we work */}
        <section id="studio" className="border-b border-ink/80 px-6 py-20 md:px-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 md:grid-cols-[0.9fr_1.6fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
                #1 The studio
              </p>
              <img
                src={philosophyDiagram}
                alt=""
                aria-hidden
                className="mt-8 w-full max-w-[340px] md:max-w-[400px]"
              />
              <p className="mt-6 border-t border-ink/30 pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                FIG. 01 - 16:9, the aspect ratio of a wide shot
              </p>
            </div>
            <Reveal>
              <div className="max-w-[42em] space-y-6 text-[16px] leading-[1.75] text-ink md:text-[18px]">
                <p className="font-editorial text-[28px] uppercase leading-[1.05] tracking-tight md:text-[34px]">
                  We work across industries on purpose.
                </p>
                <p>
                  A pattern solved in one company shows up in the next. The daily intelligence
                  report we built for the AI industry now runs a second edition on clinical
                  research. The content engine is built once and run per company. Generalists
                  notice this. Specialists rebuild it.
                </p>
                <p>
                  The name is the aspect ratio of a wide shot. It is the only metaphor on this
                  page.
                </p>
              </div>
              <dl className="mt-12 grid grid-cols-1 gap-8 border-t border-ink/80 pt-8 sm:grid-cols-3">
                {practice.map((p) => (
                  <div key={p.label}>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                      {p.label}
                    </dt>
                    <dd className="mt-3 text-[14.5px] leading-[1.65] text-ink">{p.body}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Work */}
        <section
          id="work"
          className="border-t border-snow/20 bg-obsidian px-6 py-24 text-snow md:px-10"
        >
          <div className="mx-auto max-w-[1400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-snow/60">
              #2 Work
            </p>
            <h2 className="mt-8 max-w-[18ch] font-editorial text-[clamp(2.5rem,7vw,6rem)] uppercase leading-[0.95] tracking-tight text-snow">
              Six systems, in operation.
            </h2>
            <div className="mt-16 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-[max-content_1fr]">
              <div className="md:sticky md:top-24 md:self-start md:border-r md:border-snow/20 md:pr-10">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="aspect-video w-12 shrink-0 border border-snow/60 bg-snow md:w-16"
                  />
                  <span className="font-editorial text-[28px] uppercase leading-none tracking-tight text-snow md:text-[34px]">
                    16X9
                  </span>
                </div>
                <p className="mt-6 max-w-[22ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-snow/60">
                  Running today, inside the companies we build with. Some in production, some in pilot.
                </p>
              </div>
              <div>
                <FrameGrid>
                  {work.map((item) => (
                    <FrameCell key={item.name} {...item} />
                  ))}
                </FrameGrid>
                <p className="mt-14 max-w-[62ch] border-t border-snow/20 pt-5 font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-snow/60">
                  Also in motion: a compliance-gated content engine and lender-network integration
                  for a financing marketplace, and an agentic operating platform for property
                  operators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mycel */}
        <section id="mycel" className="bg-obsidian px-6 py-20 text-snow md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 items-stretch gap-14 md:grid-cols-[0.42fr_0.58fr] md:gap-16">
              <Reveal className="aspect-[16/9] w-full overflow-hidden border border-snow/20 md:aspect-auto md:h-full md:w-auto">
                <div className="h-full w-full invert">
                  <MycelBrain />
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-snow/60">
                  #3 Mycel / The platform
                </p>
                <h2 className="mt-7 font-editorial text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-tight text-snow">
                  Mycel
                </h2>
                <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.7] text-snow md:text-[17px]">
                  The agent platform our companies run on. We built it to compose agents from
                  inspectable parts, run them on the model that fits, give them memory, and hold
                  them to a standard of trust that is earned rather than declared.
                </p>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-snow/80">
                  An agent in Mycel is a versioned composition: skills, tools, rules, guardrails,
                  triggers. Each block starts untrusted. Clean runs move it up a 0 to 9 readiness
                  ladder. Past the midpoint, nothing advances without a person signing off. Every
                  run is traced. Every run is graded, and the platform proposes the next
                  improvement for a human to accept or reject. Firms share what works with each
                  other across a common market without sharing what is private.
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

        {/* Contact */}
        <section id="contact" className="border-t border-ink/80 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
              #4 Contact
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
