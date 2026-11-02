import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { StatusDot } from "@/components/site/Board";
import { INDUSTRY_PACKS } from "@/components/site/industries-data";
import {
  BILLING,
  ENGAGEMENTS,
  FUNCTIONS,
  FUNCTION_GROUPS,
  LEVELS,
  MAIL,
  PEOPLE_LEAD,
  mailto,
  THEY_BRING,
  WE_BRING,
} from "@/components/site/services-data";

type Tone = "light" | "dark";

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

/**
 * SectionHead: the folio row every frame opens with. The label sits in the
 * margin column on the heading's own rule, like a newspaper running head,
 * never stacked above the heading as an eyebrow.
 */
export function SectionHead({
  folio,
  title,
  children,
  tone = "light",
  id,
}: {
  folio: string;
  title: ReactNode;
  children?: ReactNode;
  tone?: Tone;
  id?: string;
}) {
  const rule = tone === "dark" ? "border-snow/80" : "border-ink/80";
  const label = tone === "dark" ? "text-snow/60" : "text-graphite";
  const head = tone === "dark" ? "text-snow" : "text-ink";
  const lede = tone === "dark" ? "text-snow/75" : "text-ink";
  return (
    <header
      id={id}
      className={`grid grid-cols-1 gap-3 border-t ${rule} pt-4 md:grid-cols-[200px_1fr] md:gap-10`}
    >
      <p className={`${mono} ${label} md:pt-3`}>{folio}</p>
      <div>
        <h2
          className={`text-balance font-editorial text-[clamp(2.25rem,4.6vw,3.75rem)] uppercase leading-[0.95] tracking-tight ${head}`}
        >
          {title}
        </h2>
        {children && (
          <div className={`mt-4 max-w-[62ch] text-[15px] leading-[1.65] ${lede}`}>{children}</div>
        )}
      </div>
    </header>
  );
}

/**
 * The splice. The two sides of the partnership set against each other, with
 * the multiplication sign from the wordmark cut through by a hairline, the way
 * a film splice joins two strips. The one authored motion moment on the page:
 * the hairline draws down as the plate enters, then holds.
 */
export function Splice() {
  return (
    <div className="grid grid-cols-1 border border-ink/80 sm:grid-cols-[1fr_auto_1fr]">
      <SpliceSide title="The operator" items={THEY_BRING} />
      <div
        aria-hidden
        className="relative flex items-center justify-center border-y border-ink/80 py-4 sm:border-x sm:border-y-0 sm:px-8 sm:py-0"
      >
        <motion.span
          className="absolute inset-x-0 top-1/2 h-px origin-left bg-ink sm:inset-x-auto sm:inset-y-0 sm:left-1/2 sm:top-0 sm:h-auto sm:w-px sm:origin-top"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ originX: 0, originY: 0 }}
        />
        <span className="relative bg-background px-2 font-editorial text-[64px] leading-none text-ink sm:px-0 sm:py-2 md:text-[88px]">
          ×
        </span>
      </div>
      <SpliceSide title="16x9" items={WE_BRING} />
      <p className="border-t border-ink/80 px-5 py-3 text-[14px] leading-[1.55] text-ink sm:col-span-3 md:px-6">
        AI does most of the routine work. Your people keep the decisions. We share in what the
        company earns.
      </p>
    </div>
  );
}

function SpliceSide({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="px-5 py-5 md:px-6 md:py-6">
      <p className={`${mono} text-graphite`}>{title} brings</p>
      <ul className="mt-3">
        {items.map((it) => (
          <li
            key={it}
            className="border-t border-ink/20 py-2.5 text-[15px] leading-snug text-ink first:border-t-0"
          >
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The engagement path, on the dark plate. Five stops on one track, ordered by
 * how much of the company we take on; the scale under the track says so, which
 * is the only reason the order is shown.
 */
export function EngagementPath({ detailed = false }: { detailed?: boolean }) {
  return (
    <div>
      <div className="relative hidden lg:block" aria-hidden>
        <div className="absolute inset-x-0 top-[5px] h-px bg-snow/40" />
        <div className="grid grid-cols-5 gap-6">
          {ENGAGEMENTS.map((e) => (
            <span
              key={e.key}
              className="relative block h-[11px] w-[11px] border border-snow bg-obsidian"
            />
          ))}
        </div>
      </div>
      <ol className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:mt-5 lg:grid-cols-5">
        {ENGAGEMENTS.map((e) => (
          <li
            key={e.key}
            className="group border-t border-snow/20 py-5 transition-colors lg:border-t-0 lg:py-0"
          >
            <h3 className="font-editorial text-[26px] uppercase leading-[1] tracking-tight text-snow md:text-[28px]">
              {e.name}
            </h3>
            <p className={`mt-2 ${mono} text-[10.5px] text-snow/60`}>{e.form}</p>
            <p className="mt-3 text-[14px] leading-[1.55] text-snow/80">{e.body}</p>
            {detailed && (
              <p className="mt-3 border-t border-snow/20 pt-3 text-[13px] leading-[1.5] text-snow">
                <span className={`${mono} mr-2 text-[10.5px] text-snow/60`}>You keep</span>
                {e.keeps}
              </p>
            )}
          </li>
        ))}
      </ol>
      <div
        className="mt-8 flex items-center gap-4 border-t border-snow/20 pt-3"
        aria-hidden={false}
      >
        <span className={`${mono} text-[10.5px] text-snow/60`}>Less of the company</span>
        <span aria-hidden className="h-px flex-1 bg-snow/30" />
        <span className={`${mono} text-[10.5px] text-snow/60`}>More of the company</span>
      </div>
    </div>
  );
}

/** The industries, as an index: the trade in the display face, the first build beside it. */
export function IndustryIndex() {
  const odd = INDUSTRY_PACKS.length % 2 === 1;
  return (
    <ul className="grid grid-cols-1 border-b border-ink/80 lg:grid-cols-2 lg:gap-x-10">
      {INDUSTRY_PACKS.map((ind, i) => (
        <li
          key={ind.key}
          className={`${odd && i === INDUSTRY_PACKS.length - 1 ? "lg:col-span-2" : ""} border-t border-ink/30`}
        >
          <Link
            to="/industries/$slug"
            params={{ slug: ind.key }}
            className="group grid grid-cols-1 gap-1 px-1 py-4 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-baseline sm:gap-6"
          >
            <span className="font-editorial text-[24px] uppercase leading-[1] tracking-tight md:text-[28px]">
              {ind.name}
            </span>
            <span className="text-[13.5px] leading-[1.5] text-graphite group-hover:text-background/80 group-focus-visible:text-background/80">
              {ind.start}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Wayfinding across the services pages. A row of the same structural grid as the nav. */
const SERVICE_PAGES = [
  { to: "/services", label: "Overview" },
  { to: "/services/functions", label: "Functions" },
  { to: "/industries", label: "Industries" },
  { to: "/partners", label: "Partners" },
] as const;

export function ServicesNav() {
  return (
    <nav aria-label="Services" className="px-6 md:px-10">
      <ul className="mx-auto flex max-w-[1400px] flex-wrap border-b border-ink/30">
        {SERVICE_PAGES.map((p) => (
          <li key={p.to}>
            <Link
              to={p.to}
              activeOptions={{ exact: true }}
              className="block px-3 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite transition-colors first:pl-0 hover:text-ink focus-visible:text-ink focus-visible:underline focus-visible:outline-none sm:px-4"
              activeProps={{
                className: "text-ink underline underline-offset-[6px]",
                "aria-current": "page",
              }}
            >
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The three levels, one column each, with the function names under each. */
export function LevelSummary() {
  return (
    <ol className="grid grid-cols-1 gap-x-10 md:grid-cols-3">
      {LEVELS.map((l) => {
        const groups = FUNCTION_GROUPS.filter((g) => g.level === l.key);
        const names = l.key === "assist" ? PEOPLE_LEAD : groups.map((g) => g.name);
        return (
          <li key={l.key} className="border-t border-ink/80 py-5">
            <h3 className="font-editorial text-[28px] uppercase leading-[1] tracking-tight text-ink">
              {l.name}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.6] text-ink">{l.line}</p>
            <ul className="mt-4">
              {names.map((n) => (
                <li
                  key={n}
                  className="border-t border-ink/20 py-2 text-[13.5px] leading-snug text-graphite"
                >
                  {n}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The ledger: every function group, by level. Picking an industry marks the
 * groups that usually come first for it and shows that trade's own tasks.
 * Status is printed only where an audited board row backs it.
 */
export function FunctionLedger() {
  const [industry, setIndustry] = useState("");
  const id = useId();
  const ref = useRef<HTMLSelectElement>(null);
  // A pick made before hydration lives only in the DOM; adopt it once React takes over.
  useEffect(() => {
    if (ref.current?.value) setIndustry(ref.current.value);
  }, []);
  const pack = INDUSTRY_PACKS.find((p) => p.key === industry);
  const first = new Set(pack?.first ?? []);
  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-ink/80 py-4 md:flex-row md:items-baseline md:justify-between">
        <label htmlFor={`${id}-ind`} className={`${mono} text-graphite`}>
          Read it for your industry
        </label>
        <select
          id={`${id}-ind`}
          ref={ref}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="cursor-pointer appearance-none border-0 border-b-2 border-ink bg-transparent px-0 pb-0.5 font-editorial text-[24px] uppercase leading-[1.1] tracking-tight text-ink [field-sizing:content] hover:border-graphite focus-visible:bg-ink/[0.06] focus-visible:outline-none"
        >
          <option value="">All industries</option>
          {INDUSTRY_PACKS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div aria-live="polite">
        {pack && (
          <div className="grid grid-cols-1 gap-4 border-b border-ink/30 bg-ink px-5 py-5 text-background md:grid-cols-[200px_1fr] md:gap-10 md:px-6">
            <p className={`${mono} text-background/70`}>In {pack.name.toLowerCase()}</p>
            <div>
              <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {pack.tasks.map((t) => (
                  <li
                    key={t}
                    className="border-t border-background/20 py-2 text-[14px] leading-snug first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              {pack.note && <p className="mt-3 text-[13px] text-background/75">{pack.note}</p>}
            </div>
          </div>
        )}
      </div>

      {LEVELS.filter((l) => l.key !== "assist").map((l) => (
        <section key={l.key} aria-labelledby={`${id}-${l.key}`} className="mt-12">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr] md:gap-10">
            <p className={`${mono} text-graphite md:pt-2`}>
              {l.key === "run" ? "Level one" : "Level two"}
            </p>
            <div>
              <h2
                id={`${id}-${l.key}`}
                className="font-editorial text-[clamp(2rem,3.6vw,2.75rem)] uppercase leading-[0.95] tracking-tight text-ink"
              >
                {l.name}
              </h2>
              <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-ink">{l.line}</p>
            </div>
          </div>
          <ul className="mt-6 border-b border-ink/80">
            {FUNCTION_GROUPS.filter((g) => g.level === l.key).map((g) => {
              const marked = first.has(g.key);
              const dim = pack && !marked;
              return (
                <li
                  key={g.key}
                  id={g.key}
                  className={`grid grid-cols-1 gap-3 border-t border-ink/30 py-5 transition-opacity duration-300 md:grid-cols-[200px_1.3fr_1fr] md:gap-10 lg:grid-cols-[200px_1.4fr_0.9fr_0.9fr] ${dim ? "opacity-35" : ""}`}
                >
                  <div>
                    <h3 className="font-editorial text-[24px] uppercase leading-[1] tracking-tight text-ink">
                      {g.name}
                    </h3>
                    {marked && (
                      <p className={`mt-2 ${mono} text-[10.5px] text-ink`}>
                        <span
                          aria-hidden
                          className="mr-1.5 inline-block h-[6px] w-[6px] bg-ink align-middle"
                        />{" "}
                        First for {pack?.name.toLowerCase()}
                      </p>
                    )}
                  </div>
                  <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[14px] leading-[1.6] text-ink">
                    {g.tasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="text-[13.5px] leading-[1.55] text-graphite">
                    <span className={`${mono} mb-1 block text-[10.5px]`}>A person still</span>
                    {g.keeps}
                  </p>
                  <div className="text-[13px] leading-[1.5] text-graphite md:col-start-2 lg:col-start-auto">
                    <span className={`${mono} mb-1 block text-[10.5px]`}>In our companies</span>
                    {g.status ? (
                      <>
                        <StatusDot status={g.status} tone="light" />
                        <span className="mt-1 block">{g.proof}</span>
                      </>
                    ) : (
                      <span>Not yet running in our own companies.</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/**
 * Where we would start, as a sentence the reader completes. Where the hours go
 * picks the first function; how the contracts bill says whether the saving
 * stays as margin, the one nuance that decides whether this is worth doing.
 */
export function StartSentence() {
  const [fn, setFn] = useState(FUNCTIONS[0].key);
  const [bill, setBill] = useState(BILLING[0].key);
  const id = useId();
  const fnRef = useRef<HTMLSelectElement>(null);
  const billRef = useRef<HTMLSelectElement>(null);
  // Same as the ledger: keep a choice made before hydration.
  useEffect(() => {
    if (fnRef.current?.value) setFn(fnRef.current.value);
    if (billRef.current?.value) setBill(billRef.current.value);
  }, []);
  const f = FUNCTIONS.find((x) => x.key === fn) ?? FUNCTIONS[0];
  const b = BILLING.find((x) => x.key === bill) ?? BILLING[0];
  const select =
    "max-w-full cursor-pointer appearance-none [field-sizing:content] border-0 border-b-2 border-ink bg-transparent px-0 pb-0.5 font-editorial text-inherit uppercase leading-[1.1] tracking-tight text-ink hover:border-graphite focus-visible:bg-ink/[0.06] focus-visible:outline-none";
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
      <form
        aria-label="Where your team's hours go"
        onSubmit={(e) => e.preventDefault()}
        className="font-editorial text-[clamp(1.75rem,3.4vw,2.75rem)] uppercase leading-[1.2] tracking-tight text-ink"
      >
        <label htmlFor={`${id}-fn`}>Most of our team&rsquo;s hours go to </label>
        <select
          id={`${id}-fn`}
          ref={fnRef}
          value={fn}
          onChange={(e) => setFn(e.target.value)}
          className={select}
        >
          {FUNCTIONS.map((x) => (
            <option key={x.key} value={x.key}>
              {x.phrase}
            </option>
          ))}
        </select>
        <span>. </span>
        <label htmlFor={`${id}-bill`}>Our contracts bill </label>
        <select
          id={`${id}-bill`}
          ref={billRef}
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          className={select}
        >
          {BILLING.map((x) => (
            <option key={x.key} value={x.key}>
              {x.phrase}
            </option>
          ))}
        </select>
        <span>.</span>
      </form>
      <div aria-live="polite" className="border-t border-ink/80">
        <div className="border-b border-ink/30 py-4">
          <p className={`${mono} text-graphite`}>Where we would start</p>
          <p className="mt-2 text-[17px] font-medium leading-snug text-ink">{f.name}</p>
          <p className="mt-1 text-[14px] leading-[1.6] text-ink">{f.body}</p>
        </div>
        <div className="py-4">
          <p className={`${mono} text-graphite`}>What it does for your margin</p>
          <p className="mt-2 text-[14px] leading-[1.6] text-ink">{b.note}</p>
        </div>
      </div>
    </div>
  );
}

/** The opening frame of every services page: the headline, a rule, the lede beside an aside. */
export function PageFront({
  title,
  lede,
  aside,
}: {
  title: ReactNode;
  lede: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="px-6 pb-12 pt-10 md:px-10 md:pt-14">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="max-w-[24ch] text-balance font-editorial text-[clamp(2.75rem,7vw,6rem)] uppercase leading-[0.9] tracking-[-0.01em] text-ink">
          {title}
        </h1>
        <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink/80 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="max-w-[56ch] text-[17px] leading-[1.6] text-ink md:text-[18px]">
            {lede}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

/** The closing band: one heading, one sentence, one email door with its own subject line. */
export function CloseBand({
  title,
  body,
  subject,
}: {
  title: string;
  body: string;
  subject: string;
}) {
  return (
    <section className="bg-ink px-6 py-14 text-background md:px-10 md:py-20">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
        <h2 className="text-balance font-editorial text-[clamp(2.5rem,5.5vw,4.5rem)] uppercase leading-[0.92] tracking-tight">
          {title}
        </h2>
        <div>
          <p className="max-w-[48ch] text-[15px] leading-[1.65] text-background/85">{body}</p>
          <a
            href={mailto(subject)}
            className="mt-6 inline-flex items-center gap-3 bg-background px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-silver-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
          >
            {MAIL} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/** Plain questions and answers. Native details/summary: works without JavaScript and on any phone. */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-b border-ink/80">
      {items.map((it) => (
        <details key={it.q} className="group border-t border-ink/30">
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 px-1 py-4 text-[17px] font-medium leading-snug text-ink hover:bg-ink/[0.03] focus-visible:bg-ink/[0.06] focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            {it.q}
            <span
              aria-hidden
              className="font-mono text-[14px] text-graphite group-open:rotate-45 transition-transform"
            >
              +
            </span>
          </summary>
          <p className="max-w-[70ch] px-1 pb-5 text-[15px] leading-[1.65] text-ink">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
