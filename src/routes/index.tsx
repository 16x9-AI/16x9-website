import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import { FrameGrid, FrameCell } from "@/components/site/FrameGrid";
import { MycelBrain } from "@/components/site/MycelBrain";
import { JoinForm } from "@/components/site/JoinForm";
import { JoinNotes } from "@/components/site/JoinNotes";
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

const experiments = [
  {
    number: "01",
    name: "Agents in the Field",
    outcome: "Running quoting and scheduling through agents taught us where autonomy needs a human watching.",
    art: artAgentField,
  },
  {
    number: "02",
    name: "The Stretch Point",
    outcome: "One research pass can carry a week of content before the quality starts slipping.",
    art: artContentDerivatives,
  },
  {
    number: "03",
    name: "Long Memory",
    outcome: "Give an agent a universe of deals to remember and the humans start trusting it before they should.",
    art: artDealIntelligence,
  },
  {
    number: "04",
    name: "Writing Like Someone",
    outcome: "We taught a system to write like a person, then found exactly where the disguise breaks.",
    art: artOutreachSystems,
  },
  {
    number: "05",
    name: "Let the Data Decide",
    outcome: "Letting analytics decide what gets written next made us faster and slightly less curious.",
    art: artNewsletter,
  },
  {
    number: "06",
    name: "Quarters Into Days",
    outcome: "Compressing brand to build from quarters to days brought back speed and cost us some judgment.",
    art: artWebsiteGen,
  },
];

const mycelSpecs = [
  { label: "Function", value: "Agent memory, orchestration, structured data" },
  { label: "Role", value: "The substrate the collective builds on" },
  { label: "Google access", value: "Sign-in identity and Workspace directory only" },
  { label: "Not accessed", value: "Gmail, Calendar, Drive content" },
];

function Index() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero / Manifesto */}
        <section className="flex min-h-[calc(100dvh-8rem)] flex-col justify-between px-6 pb-10 pt-14 md:px-10 md:pt-20">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
              #0 A collective of framers
            </p>
            <h1 className="mt-8 font-editorial text-[clamp(2.75rem,10vw,9.5rem)] uppercase leading-[0.92] tracking-tight text-ink">
              We compose
              <br />
              in the wide shot.
            </h1>
            <p className="mt-8 max-w-xl font-mono text-[12px] uppercase leading-relaxed tracking-[0.08em] text-graphite">
              We were building before it paid. AI just made the instrument faster.
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

        {/* The Frame (philosophy) */}
        <section id="the-frame" className="border-b border-ink/80 px-6 py-20 md:px-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 md:grid-cols-[0.9fr_1.6fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
                #1 Philosophy / The Frame
              </p>
              <img
                src={philosophyDiagram}
                alt=""
                aria-hidden
                className="mt-8 w-full max-w-[340px] md:max-w-[400px]"
              />
              <p className="mt-6 border-t border-ink/30 pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                FIG. 01 - THE WIDE SHOT
              </p>
            </div>
            <Reveal>
              <div className="max-w-[42em] space-y-6 text-[16px] leading-[1.75] text-ink md:text-[18px]">
                <p className="font-editorial text-[28px] uppercase leading-[1.05] tracking-tight md:text-[34px]">
                  A frame is a decision about what to include.
                </p>
                <p>
                  Most frames get drawn too narrow. We stay wide, and look for polymaths: range
                  teaches the shape depth alone misses.
                </p>
                <p>
                  16x9 is the aspect ratio of that wide shot. It's also the promise that nothing
                  we build stays boxed in.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Join the Frame */}
        <section id="join" className="border-b border-ink/80 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
              #2 Join the Frame
            </p>
            <h2 className="mt-8 max-w-[18ch] font-editorial text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
              Join the frame
            </h2>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink md:text-[16px]">
              Framers, not specialists. A handful a year. One good answer is enough.
            </p>
            <div className="mt-16 grid grid-cols-1 items-stretch gap-14 md:mt-20 md:grid-cols-[0.42fr_0.58fr] md:gap-16">
              <Reveal className="flex h-full min-h-0 flex-1 flex-col">
                <JoinNotes />
              </Reveal>
              <Reveal delay={0.06}>
                <JoinForm />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Experiments */}
        <section
          id="experiments"
          className="border-y border-snow/20 bg-obsidian px-6 py-24 text-snow md:px-10"
        >
          <div className="mx-auto max-w-[1400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-snow/60">
              #3 Experiments
            </p>
            <h2 className="mt-8 max-w-[18ch] font-editorial text-[clamp(2.5rem,7vw,6rem)] uppercase leading-[0.95] tracking-tight text-snow">
              Six explorations in agentic systems.
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
                  What we built. What it taught us.
                </p>
              </div>
              <div>
                <FrameGrid>
                  {experiments.map((exp) => (
                    <FrameCell key={exp.number} {...exp} />
                  ))}
                </FrameGrid>
              </div>
            </div>
          </div>
        </section>

        {/* Mycel note */}
        <section id="mycel-note" className="border-y border-ink/80 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 items-stretch gap-14 md:grid-cols-[0.42fr_0.58fr] md:gap-16">
              <Reveal className="aspect-[16/9] w-full overflow-hidden border border-ink/30 md:aspect-auto md:h-full md:w-auto">
                <MycelBrain />
              </Reveal>
              <Reveal delay={0.06}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
                  #4 Mycel / A technical note
                </p>
                <h2 className="mt-7 font-editorial text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                  Mycel
                </h2>
                <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ink md:text-[16px]">
                  Mycel connects to Google on your behalf for sign-in and basic Workspace directory
                  information only, not Gmail, Calendar, or Drive content.
                </p>
                <dl className="mt-10 divide-y divide-ink/30 border-t border-ink/80">
                  {mycelSpecs.map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-6 py-7">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                        {row.label}
                      </dt>
                      <dd className="max-w-[26ch] text-right font-mono text-[12px] uppercase tracking-[0.06em] text-ink">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-6 py-7">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
                      Details
                    </dt>
                    <dd>
                      <Link
                        to="/mycel"
                        className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink underline underline-offset-4 hover:text-graphite"
                      >
                        Read more about Mycel →
                      </Link>
                    </dd>
                  </div>
                </dl>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
