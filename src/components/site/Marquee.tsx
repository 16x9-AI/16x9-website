const ITEM = "PANORAMIC SYNTHESIS ✦ THE WIDE SHOT ✦ FRAMERS AT WORK ✦ THE PATTERN UNDERNEATH";

/**
 * Marquee: a quiet letterpress running-head divider — hairline-bounded,
 * page-background strip, ink text. Fully static (no scroll/animation);
 * the phrase sequence is shown once, centered, and wraps gracefully on
 * narrow screens.
 */
export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-ink/30 bg-background py-2">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70 md:text-[12px]">
          {ITEM}
        </span>
      </div>
    </div>
  );
}
