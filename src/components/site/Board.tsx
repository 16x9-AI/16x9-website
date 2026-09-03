import type { ReactNode } from "react";

// The board: five newspaper columns, one per industry, on the dark plate.
// Each row is one system with its status printed as it is. No numbering:
// columns and rows are peers. Statuses are audited (see the comment above
// `board` in routes/index.tsx) and take three values only.
export type Status = "Running" | "Pilot" | "Building";
export type Tone = "dark" | "light";

export type BoardRowData = {
  status: Status;
  name: string;
  outcome: ReactNode;
};

export type BoardColumnData = {
  industry: string;
  context: string;
  art: string;
  rows: BoardRowData[];
  also?: string;
};

export function StatusDot({ status, tone = "dark" }: { status: Status; tone?: Tone }) {
  const solid = tone === "dark" ? "bg-snow" : "bg-ink";
  const half = tone === "dark" ? "bg-snow/50" : "bg-ink/50";
  const hollow = tone === "dark" ? "border border-snow/50" : "border border-ink/50";
  const text = tone === "dark" ? "text-snow/60" : "text-graphite";
  const dot = status === "Running" ? solid : status === "Pilot" ? half : hollow;
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] ${text}`}>
      <span aria-hidden className={`inline-block h-[6px] w-[6px] ${dot}`} />
      {status}
    </span>
  );
}

export function BoardRow({ row, tone = "dark" }: { row: BoardRowData; tone?: Tone }) {
  const name = tone === "dark" ? "text-snow" : "text-ink";
  const body = tone === "dark" ? "text-snow/75" : "text-graphite";
  const rule = tone === "dark" ? "border-snow/20" : "border-ink/30";
  return (
    <li className={`border-t ${rule} pt-3 pb-4`}>
      <StatusDot status={row.status} tone={tone} />
      <p className={`mt-1.5 text-[14px] font-medium leading-snug ${name}`}>{row.name}</p>
      <p className={`mt-1 text-[13px] leading-[1.5] ${body}`}>{row.outcome}</p>
    </li>
  );
}

export function BoardColumn({ col }: { col: BoardColumnData }) {
  return (
    <div className="flex flex-col">
      <h3 className="font-editorial text-[24px] uppercase leading-none tracking-tight text-snow">
        {col.industry}
      </h3>
      <p className="mt-2 min-h-[2.6em] font-mono text-[11px] uppercase leading-relaxed tracking-[0.06em] text-snow/60">
        {col.context}
      </p>
      {/* Art is a desktop device; on a phone the five columns stack and it only adds scroll. */}
      <div className="mt-4 hidden aspect-[2/1] w-full overflow-hidden border border-snow/20 sm:block">
        <img src={col.art} alt="" aria-hidden className="art-invert h-full w-full object-cover" />
      </div>
      <ul className="mt-4">
        {col.rows.map((r) => (
          <BoardRow key={r.name} row={r} />
        ))}
      </ul>
      {col.also && (
        <p className="mt-auto border-t border-snow/20 pt-3 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-snow/55">
          {col.also}
        </p>
      )}
    </div>
  );
}
