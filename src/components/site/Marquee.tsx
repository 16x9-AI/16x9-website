/**
 * Marquee: a quiet letterpress running-head divider. Hairline-bounded,
 * page-background strip, ink text, fully static. Items wrap only at the
 * separators, never inside an item. Decorative: the same facts appear in
 * the frames it divides, so it is hidden from assistive tech.
 */
export function Marquee({ items }: { items: string[] }) {
  return (
    <div aria-hidden className="overflow-hidden border-y border-ink/30 bg-background py-2">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70 md:text-[12px]">
        {items.map((item, i) => (
          <span key={item} className="contents">
            {i > 0 && <span>✦</span>}
            <span className="whitespace-nowrap">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
