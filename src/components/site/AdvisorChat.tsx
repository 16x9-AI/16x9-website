import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { askAdvisor, type Turn } from "@/lib/advisor";
import { trackEvent } from "@/lib/analytics";
import { MAIL } from "@/components/site/services-data";

// "Ask 16x9": the homepage advisor strip. The conversation lives only in this component's state
// (no storage, no cookies). Replies come from the Mycel agent x9_site_advisor through the server
// relay in src/lib/advisor.ts; when that relay is not configured, the strip says so plainly and
// points to the scorecard and email instead of pretending.

const mono = "font-mono text-[11px] uppercase tracking-[0.14em]";

const STARTERS = [
  "We're a 40-person accounting firm.",
  "I run a medical practice with three locations.",
  "I know a trade and want to build a company with you.",
  "How do you get paid?",
];

const FALLBACK: Record<string, string> = {
  offline:
    "The advisor is not switched on yet. In the meantime, the two-minute scorecard shows where AI fits in your business, or write to us and a person will reply.",
  busy: "That's a lot of questions in a short time. Give it a few minutes, try the scorecard, or write to us.",
  invalid: "Something in that message didn't come through. Try a shorter one.",
  error:
    "The advisor didn't answer just now. Try again in a moment, or write to us and a person will reply.",
};

export function AdvisorChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns, pending]);

  const send = async (text: string) => {
    const msg = text.trim().slice(0, 800);
    if (!msg || pending) return;
    const next: Turn[] = [...turns, { role: "visitor", text: msg }];
    setTurns(next);
    setDraft("");
    setNotice(null);
    setPending(true);
    trackEvent("advisor_message", { turn: next.filter((t) => t.role === "visitor").length });
    try {
      const r = await askAdvisor({ data: { turns: next } });
      if (r.ok) setTurns([...next, { role: "advisor", text: r.text }]);
      else setNotice(FALLBACK[r.reason] ?? FALLBACK.error);
    } catch {
      setNotice(FALLBACK.error);
    } finally {
      setPending(false);
    }
  };

  const open = turns.length > 0 || notice !== null;

  return (
    <section aria-label="Ask 16x9" className="border border-ink/80">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/80 px-4 py-2.5 md:px-5">
        <h2 className={`${mono} text-ink`}>Ask 16x9 about your business</h2>
        <p className="text-[12.5px] text-graphite">
          Answers come from AI and can be wrong. Please don't share personal, financial or patient
          details.
        </p>
      </div>

      {open && (
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          className="max-h-[360px] space-y-4 overflow-y-auto px-4 py-4 md:px-5"
        >
          {turns.map((t, i) => (
            <div key={i} className={t.role === "visitor" ? "flex justify-end" : "flex"}>
              <p
                className={`max-w-[62ch] whitespace-pre-line text-[15px] leading-[1.6] ${
                  t.role === "visitor" ? "bg-ink px-3.5 py-2 text-background" : "text-ink"
                }`}
              >
                <span className="sr-only">{t.role === "visitor" ? "You: " : "16x9: "}</span>
                {t.text}
              </p>
            </div>
          ))}
          {pending && <p className={`${mono} text-graphite`}>Thinking…</p>}
          {notice && (
            <div className="border-t border-ink/30 pt-3 text-[15px] leading-[1.6] text-ink">
              <p>{notice}</p>
              <p className="mt-2 flex flex-wrap gap-4">
                <Link to="/scorecard" className="underline underline-offset-4 hover:text-graphite">
                  Open the scorecard
                </Link>
                <a
                  href={`mailto:${MAIL}?subject=Question%20from%20the%20site`}
                  className="underline underline-offset-4 hover:text-graphite"
                >
                  {MAIL}
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        className="flex items-stretch border-t border-ink/30 first:border-t-0"
      >
        <label htmlFor="ask-16x9" className="sr-only">
          Tell us what your company does
        </label>
        <input
          id="ask-16x9"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={800}
          autoComplete="off"
          placeholder="Tell us what your company does, and where the hours go"
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[16px] text-ink placeholder:text-graphite focus-visible:bg-ink/[0.04] focus-visible:outline-none md:px-5"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className="border-l border-ink/80 bg-ink px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-background transition-colors hover:bg-ash disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Ask
        </button>
      </form>

      {!open && (
        <ul
          aria-label="Ways to start"
          className="flex flex-wrap gap-2 border-t border-ink/30 px-4 py-3 md:px-5"
        >
          {STARTERS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => void send(s)}
                className="border border-ink/40 px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
