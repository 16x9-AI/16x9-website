import { useId, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BILLING,
  ENGAGEMENTS,
  FUNCTIONS,
  INDUSTRIES,
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
        Most of the work moves onto agents. People keep the decisions. We share in what the company
        earns.
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
  return (
    <ul className="grid grid-cols-1 border-b border-ink/80 lg:grid-cols-2 lg:gap-x-10">
      {INDUSTRIES.map((ind, i) => (
        <li
          key={ind.name}
          className={`${i === INDUSTRIES.length - 1 && INDUSTRIES.length % 2 === 1 ? "lg:col-span-2" : ""} group grid grid-cols-1 gap-1 border-t border-ink/30 py-4 transition-colors hover:bg-ink hover:text-background sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-baseline sm:gap-6`}
        >
          <span className="px-1 font-editorial text-[24px] uppercase leading-[1] tracking-tight md:text-[28px]">
            {ind.name}
          </span>
          <span className="px-1 text-[13.5px] leading-[1.5] text-graphite group-hover:text-background/80">
            {ind.start}
          </span>
        </li>
      ))}
    </ul>
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
