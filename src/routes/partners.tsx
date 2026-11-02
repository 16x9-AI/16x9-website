import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Motif } from "@/components/site/Motif";
import { CloseBand, PageFront, SectionHead, ServicesNav, Splice } from "@/components/site/Services";
import { mailto } from "@/components/site/services-data";

const TITLE = "Partners | 16x9";
const DESCRIPTION =
  "16x9 partners with operators who know a trade. You bring the customers, relationships and distribution. We build and run the company on agents, for equity or a share of revenue.";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://16x9.ai/partners" },
    ],
    links: [{ rel: "canonical", href: "https://16x9.ai/partners" }],
  }),
  component: PartnersPage,
});

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

// The order is the order a partnership runs in, which is why it is shown.
const STAGES = [
  {
    h: "The trade",
    body: "You bring a market you know: the customers, the relationships, a reason to be trusted, and a way to reach more.",
  },
  {
    h: "The measure",
    body: "We measure how the work runs today, or would run, and rank what agents can take on by what it does for margin.",
  },
  {
    h: "The build",
    body: "Forward-deployed engineers and operators build the company's operations on Mycel. You lead growth, product and sales.",
  },
  {
    h: "The structure",
    body: "Equity, a share of revenue, or another joint-venture form, agreed in writing before the build starts.",
  },
  {
    h: "What comes next",
    body: "A lean company has options: add-on acquisitions, a raise, or a sale at a better multiple. A partner desk runs that work when it is time.",
  },
];

const DOORS = [
  {
    label: "Operators and founders",
    text: "You know a trade and its customers. You want to start or lead a company that runs on agents.",
    subject: "Operator partnership",
  },
  {
    label: "Owners",
    text: "You run an established company and would rather partner than buy services. We can take a share of what the change adds.",
    subject: "Owner partnership",
  },
  {
    label: "Holding companies and investors",
    text: "You own several companies and want one operating layer under all of them.",
    subject: "Portfolio operations",
  },
  {
    label: "Brokers and advisers",
    text: "You see the companies first. Bring us the ones that should run leaner before they sell, and we agree terms at the introduction.",
    subject: "Broker introduction",
  },
];

function PartnersPage() {
  return (
    <>
      <Nav />
      <ServicesNav />
      <main>
        <PageFront
          title="Know a trade? Build the company with us."
          lede={
            <p>
              The people who know an industry are rarely the people who can rebuild its operations
              on agents. We pair the two. You keep the customer and the relationship. We build the
              machine, run it, and share in what the company earns.
            </p>
          }
          aside={
            <div className="hidden aspect-[3/1] w-full overflow-hidden border border-ink/80 bg-obsidian text-snow sm:block">
              <Motif kind="wideshot" />
            </div>
          }
        />

        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="The model" title="Two sides, one company." />
            <Reveal className="mt-10 lg:ml-[240px]">
              <Splice />
            </Reveal>
          </div>
        </section>

        <section className="bg-obsidian px-6 py-12 text-snow md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="How it runs" title="From a trade to a company." tone="dark" />
            <ol className="mt-10 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-5">
              {STAGES.map((s, i) => (
                <li key={s.h} className="border-t border-snow/30 py-5">
                  <p className={`${mono} text-[10.5px] text-snow/60`}>
                    {i + 1} of {STAGES.length}
                  </p>
                  <h3 className="mt-2 font-editorial text-[26px] uppercase leading-[1] tracking-tight text-snow">
                    {s.h}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.6] text-snow/80">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[1400px]">
            <SectionHead folio="Who we partner with" title="Four ways to start." />
            <ul aria-label="Who we partner with" className="mt-10 border-b border-ink/80">
              {DOORS.map((d) => (
                <li key={d.label} className="border-t border-ink/30">
                  <a
                    href={mailto(d.subject)}
                    className="group grid grid-cols-1 gap-1 px-1 py-5 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none md:grid-cols-[240px_1fr_auto] md:items-baseline md:gap-6"
                  >
                    <span className="font-editorial text-[24px] uppercase leading-[1] tracking-tight">
                      {d.label}
                    </span>
                    <span className="text-[15px] leading-[1.55]">{d.text}</span>
                    <span aria-hidden className="hidden font-mono text-[12px] md:block">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 pb-14 md:px-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="border-t border-ink/80 pt-4">
              <h2 className="font-editorial text-[clamp(2rem,3.6vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                An operator community is forming.
              </h2>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.65] text-ink">
                Founders, operators and owners who know an industry, in one place, comparing what
                works. Write with the trade you know and we will add you when it opens.
              </p>
            </div>
            <div className="border-t border-ink/80 pt-4">
              <h2 className="font-editorial text-[clamp(2rem,3.6vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink">
                We build on ourselves first.
              </h2>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.65] text-ink">
                Every partnership runs on systems already working in our own companies, audited and
                labelled by status.
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                <Link
                  to="/"
                  hash="work"
                  className="underline underline-offset-4 hover:text-graphite"
                >
                  See what runs
                </Link>{" "}
                <span aria-hidden>→</span>
              </p>
            </div>
          </div>
        </section>

        <CloseBand
          title="Tell us the trade you know."
          body="Who your customers are, how you reach them, and what slows the work down today. The first conversation is about the market, not the software."
          subject="Operator partnership"
        />
      </main>
      <Footer />
    </>
  );
}
