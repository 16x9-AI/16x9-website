import type { ReactNode } from "react";

/**
 * Marquee: a quiet letterpress running-head divider. Hairline-bounded,
 * page-background strip, ink text. The track holds the items twice and drifts
 * at reading speed; under prefers-reduced-motion the global override stops
 * it and the first copy simply sits centred. Decorative: the same facts
 * appear in the frames it divides, so it is hidden from assistive tech.
 */
export function Marquee({ items }: { items: ReactNode[] }) {
  const copy = (k: string) =>
    items.map((item, i) => (
      <span key={`${k}-${i}`} className="contents">
        <span className="whitespace-nowrap">{item}</span>
        <span className="px-3">✦</span>
      </span>
    ));
  return (
    <div
      aria-hidden
      className="marquee-mask overflow-hidden border-y border-ink/30 bg-background py-2"
    >
      <div className="animate-marquee-drift flex w-max items-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70 md:text-[12px]">
        <span className="flex items-center">{copy("a")}</span>
        <span className="flex items-center">{copy("b")}</span>
      </div>
    </div>
  );
}
