import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageFront, ServicesNav } from "@/components/site/Services";
import { Scorecard, TESTS } from "@/components/site/Scorecard";
import { breadcrumbs, pageHead } from "@/lib/seo";

const DESCRIPTION =
  "A two-minute scorecard: grade the work that eats your team's week on five plain tests, and see the hours and cost at stake. Runs in your browser; nothing is sent unless you choose.";

export const Route = createFileRoute("/scorecard")({
  head: () =>
    pageHead({
      title: "Where AI fits in your business: a two-minute scorecard | 16x9",
      description: DESCRIPTION,
      path: "/scorecard",
      jsonLd: [
        {
          "@type": "WebApplication",
          name: "Where AI fits: back-office scorecard",
          url: "https://16x9.ai/scorecard",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          isAccessibleForFree: true,
          provider: { "@id": "https://16x9.ai/#organization" },
        },
        breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Scorecard", path: "/scorecard" },
        ]),
      ],
    }),
  component: ScorecardPage,
});

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

function ScorecardPage() {
  return (
    <>
      <Nav />
      <ServicesNav />
      <main>
        <PageFront
          title="Where AI fits in your business."
          lede={
            <p>
              Two minutes. Pick your industry, list the work that eats your team's week, and answer
              five yes-or-no questions for each. You get a grade for each kind of work and the hours
              and cost at stake, in your own numbers. It runs in your browser. Nothing is sent
              anywhere unless you choose to send it.
            </p>
          }
          aside={
            <ol className="self-start border-b border-ink/30">
              {TESTS.map((t, i) => (
                <li
                  key={t.key}
                  className="grid grid-cols-[28px_1fr] gap-3 border-t border-ink/30 py-2.5"
                >
                  <span className={`${mono} pt-0.5 text-graphite`}>{i + 1}</span>
                  <span className="text-[15px] leading-snug text-ink">{t.q}</span>
                </li>
              ))}
            </ol>
          }
        />
        <section className="px-6 pb-16 md:px-10">
          <div className="mx-auto max-w-[1400px]">
            <Scorecard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
