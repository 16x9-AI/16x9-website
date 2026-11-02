import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { INDUSTRY_PACKS, packByKey } from "@/components/site/industries-data";
import { BILLING, FUNCTION_GROUPS, mailto } from "@/components/site/services-data";

// "Where AI fits": a scorecard that runs entirely in the browser. No model, no network, nothing
// stored. It grades each chore on the same five tests as /services/functions and shows what is
// at stake in the visitor's own numbers. It never estimates savings: that would need an
// automation percentage, and we do not publish one until it is measured (PRODUCT.md).

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

export const TESTS = [
  { key: "volume", label: "Many times a day", q: "Does it happen many times a day or week?" },
  { key: "rules", label: "Follows rules", q: "Does a checklist or a policy decide most cases?" },
  { key: "digital", label: "Arrives digital", q: "Does it arrive as email, PDFs or spreadsheets?" },
  { key: "checkable", label: "Can be checked", q: "Can the result be checked against a source?" },
  { key: "gate", label: "Caught in time", q: "Can a mistake be caught before it hurts anyone?" },
] as const;
type TestKey = (typeof TESTS)[number]["key"];

type Chore = { key: string; hours: string; answers: Record<TestKey, boolean> };

const SIZES = ["1 to 10 people", "11 to 50 people", "51 to 200 people", "More than 200 people"];
const WEEKS = 48; // working weeks in a year, a plain planning convention

const emptyAnswers = (): Record<TestKey, boolean> => ({
  volume: false,
  rules: false,
  digital: false,
  checkable: false,
  gate: false,
});

/** A to D from the number of tests a chore passes. Three or more makes it a candidate. */
export function grade(n: number): "A" | "B" | "C" | "D" {
  return n >= 5 ? "A" : n === 4 ? "B" : n === 3 ? "C" : "D";
}

const GRADE_LINE: Record<string, string> = {
  A: "A strong first candidate.",
  B: "A good candidate, with a person signing off.",
  C: "Possible, once the rules are written down.",
  D: "Keep this with your people for now.",
};

export function Scorecard() {
  const id = useId();
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [bill, setBill] = useState("");
  const [outsourced, setOutsourced] = useState(false);
  const [rate, setRate] = useState("");
  const [chores, setChores] = useState<Chore[]>([]);

  // Preselect the functions that usually come first for the chosen industry.
  useEffect(() => {
    const pack = packByKey(industry);
    if (!pack) return;
    setChores((cur) =>
      cur.length ? cur : pack.first.map((key) => ({ key, hours: "", answers: emptyAnswers() })),
    );
  }, [industry]);

  const pack = packByKey(industry);
  const billing = BILLING.find((b) => b.key === bill);

  const rows = useMemo(
    () =>
      chores.map((c) => {
        const passed = TESTS.filter((t) => c.answers[t.key]).length;
        const hours = Math.max(0, Number(c.hours) || 0);
        return { ...c, passed, hours, grade: grade(passed) };
      }),
    [chores],
  );
  const candidates = rows.filter((r) => r.passed >= 3);
  const hoursAtStake = candidates.reduce((s, r) => s + r.hours, 0);
  const rateNum = Math.max(0, Number(rate) || 0);
  const yearCost = Math.round(hoursAtStake * WEEKS * rateNum);
  const answered = rows.some((r) => r.hours > 0);

  const toggle = (i: number, k: TestKey) =>
    setChores((cur) =>
      cur.map((c, j) => (j === i ? { ...c, answers: { ...c.answers, [k]: !c.answers[k] } } : c)),
    );
  const setHours = (i: number, v: string) =>
    setChores((cur) => cur.map((c, j) => (j === i ? { ...c, hours: v } : c)));
  const remove = (i: number) => setChores((cur) => cur.filter((_, j) => j !== i));
  const add = (key: string) =>
    key &&
    chores.length < 5 &&
    !chores.some((c) => c.key === key) &&
    setChores((cur) => [...cur, { key, hours: "", answers: emptyAnswers() }]);

  const groupName = (k: string) => FUNCTION_GROUPS.find((g) => g.key === k)?.name ?? k;

  const summary = [
    `Industry: ${pack?.name ?? "not given"}. Team: ${size || "not given"}. Contracts bill: ${billing?.phrase ?? "not given"}. Outsourced back office: ${outsourced ? "yes" : "no"}.`,
    ...rows.map(
      (r) =>
        `${groupName(r.key)}: ${r.hours} hours a week, passes ${r.passed} of 5 tests, grade ${r.grade}.`,
    ),
    `Hours a week on work that scores C or better: ${hoursAtStake}.`,
    rateNum
      ? `At $${rateNum} an hour, that is about $${yearCost.toLocaleString("en-US")} a year.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const field =
    "w-full border-0 border-b-2 border-ink bg-transparent px-0 py-1.5 text-[16px] text-ink focus-visible:bg-ink/[0.05] focus-visible:outline-none";

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      <form aria-label="Where AI fits scorecard" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="border-t border-ink/80 pt-4">
          <legend className={`${mono} text-graphite`}>1. Your business</legend>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-[14px] text-ink">Industry</span>
              <select
                className={field}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Pick one</option>
                {INDUSTRY_PACKS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[14px] text-ink">Team size</span>
              <select className={field} value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="">Pick one</option>
                {SIZES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[14px] text-ink">Your contracts bill</span>
              <select className={field} value={bill} onChange={(e) => setBill(e.target.value)}>
                <option value="">Pick one</option>
                {BILLING.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.phrase}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-end gap-3 pb-2">
              <input
                type="checkbox"
                checked={outsourced}
                onChange={(e) => setOutsourced(e.target.checked)}
                className="h-5 w-5 accent-[var(--ink)]"
              />
              <span className="text-[14px] leading-snug text-ink">
                We pay an outside firm or team for some back-office work
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset className="mt-10 border-t border-ink/80 pt-4">
          <legend className={`${mono} text-graphite`}>2. The work that eats your week</legend>
          <p className="mt-3 text-[14px] leading-[1.6] text-graphite">
            Up to five kinds of work. For each, roughly how many hours your team spends a week, and
            which of the five tests it passes.
          </p>
          {chores.length === 0 && (
            <p className="mt-4 text-[15px] text-ink">
              Pick an industry, or add a kind of work below.
            </p>
          )}
          <ul className="mt-4">
            {chores.map((c, i) => (
              <li key={c.key} className="border-t border-ink/30 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[16px] font-medium text-ink">{groupName(c.key)}</span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className={`${mono} text-[10.5px] text-graphite underline-offset-4 hover:text-ink hover:underline`}
                  >
                    Remove
                  </button>
                </div>
                <label className="mt-3 flex items-baseline gap-3">
                  <span className="text-[14px] text-ink">Hours a week</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={2000}
                    value={c.hours}
                    onChange={(e) => setHours(i, e.target.value)}
                    className={`${field} w-24`}
                    aria-label={`Hours a week on ${groupName(c.key)}`}
                  />
                </label>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TESTS.map((t) => (
                    <label
                      key={t.key}
                      className="flex items-start gap-2.5 text-[14px] leading-snug text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={c.answers[t.key]}
                        onChange={() => toggle(i, t.key)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]"
                      />
                      {t.q}
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          {chores.length < 5 && (
            <label className="mt-2 block border-t border-ink/30 pt-4">
              <span className="text-[14px] text-ink">Add a kind of work</span>
              <select
                id={`${id}-add`}
                className={field}
                value=""
                onChange={(e) => add(e.target.value)}
              >
                <option value="">Choose</option>
                {FUNCTION_GROUPS.filter((g) => !chores.some((c) => c.key === g.key)).map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>

        <fieldset className="mt-10 border-t border-ink/80 pt-4">
          <legend className={`${mono} text-graphite`}>3. Optional: what an hour costs you</legend>
          <label className="mt-3 flex items-baseline gap-3">
            <span className="text-[14px] text-ink">Wages, taxes and benefits, per hour, $</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={1000}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`${field} w-24`}
            />
          </label>
        </fieldset>
      </form>

      {/* Results update as the visitor answers. */}
      <section
        aria-live="polite"
        aria-label="Your results"
        className="lg:sticky lg:top-8 lg:self-start"
      >
        <div className="border border-ink/80">
          <div className="border-b border-ink/80 bg-ink px-5 py-3 text-background md:px-6">
            <p className={`${mono} text-background/75`}>Your results</p>
          </div>
          {!answered ? (
            <p className="px-5 py-6 text-[15px] leading-[1.6] text-ink md:px-6">
              Add hours to at least one kind of work and your grades appear here.
            </p>
          ) : (
            <div className="px-5 py-5 md:px-6">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">Each kind of work against the five tests</caption>
                <thead>
                  <tr className={`${mono} text-[10px] text-graphite`}>
                    <th scope="col" className="pb-2 font-normal">
                      Work
                    </th>
                    <th scope="col" className="pb-2 text-right font-normal">
                      Hrs/wk
                    </th>
                    <th scope="col" className="pb-2 text-right font-normal">
                      Tests
                    </th>
                    <th scope="col" className="pb-2 text-right font-normal">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key} className="border-t border-ink/20 align-top">
                      <th
                        scope="row"
                        className="py-2.5 pr-3 text-[14px] font-normal leading-snug text-ink"
                      >
                        {groupName(r.key)}
                        <span className="mt-1 block text-[12.5px] text-graphite">
                          {GRADE_LINE[r.grade]}
                        </span>
                      </th>
                      <td className="py-2.5 text-right text-[14px] tabular-nums text-ink">
                        {r.hours}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className="inline-flex gap-[3px]"
                          aria-label={`${r.passed} of 5 tests`}
                        >
                          {TESTS.map((t) => (
                            <span
                              key={t.key}
                              aria-hidden
                              className={`inline-block h-[7px] w-[7px] ${
                                r.answers[t.key] ? "bg-ink" : "border border-ink/40"
                              }`}
                            />
                          ))}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-editorial text-[24px] leading-none text-ink">
                        {r.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <dl className="mt-5 border-t border-ink/80">
                <div className="flex items-baseline justify-between gap-4 border-b border-ink/30 py-3">
                  <dt className="text-[14px] text-ink">Hours a week on work graded C or better</dt>
                  <dd className="font-editorial text-[32px] leading-none text-ink">
                    {hoursAtStake}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-ink/30 py-3">
                  <dt className="text-[14px] text-ink">Hours a year</dt>
                  <dd className="font-editorial text-[32px] leading-none text-ink">
                    {(hoursAtStake * WEEKS).toLocaleString("en-US")}
                  </dd>
                </div>
                {rateNum > 0 && (
                  <div className="flex items-baseline justify-between gap-4 border-b border-ink/30 py-3">
                    <dt className="text-[14px] text-ink">What those hours cost a year</dt>
                    <dd className="font-editorial text-[32px] leading-none text-ink">
                      ${yearCost.toLocaleString("en-US")}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 text-[12.5px] leading-[1.55] text-graphite">
                This is what is at stake, not a promised saving. The assessment measures how much of
                it AI can take on, in your real work.
              </p>

              {billing && (
                <p className="mt-4 border-t border-ink/30 pt-3 text-[14px] leading-[1.6] text-ink">
                  <span className={`${mono} mb-1 block text-graphite`}>For your margin</span>
                  {billing.note}
                </p>
              )}
              <p className="mt-4 border-t border-ink/30 pt-3 text-[14px] leading-[1.6] text-ink">
                <span className={`${mono} mb-1 block text-graphite`}>Where we would start</span>
                {outsourced
                  ? "With the work you already outsource: the budget line exists and you already buy an outcome. Then the A and B grades above."
                  : candidates.length
                    ? `With ${groupName([...candidates].sort((a, b) => b.passed - a.passed || b.hours - a.hours)[0].key).toLowerCase()}, then the other A and B grades.`
                    : "With a two-week assessment to find the work that does pass the tests."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`${mailto("Scorecard results")}&body=${encodeURIComponent(summary)}`}
                  className="inline-flex items-center gap-2 bg-ink px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background hover:bg-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Send these to 16x9 <span aria-hidden>→</span>
                </a>
                {pack && (
                  <Link
                    to="/industries/$slug"
                    params={{ slug: pack.key }}
                    className="inline-flex items-center border border-ink px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none"
                  >
                    Read: {pack.name}
                  </Link>
                )}
              </div>
              <p className="mt-3 text-[12px] text-graphite">
                Nothing you enter here leaves this page unless you send it.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
