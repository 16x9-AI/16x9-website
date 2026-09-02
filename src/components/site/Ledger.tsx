import type { ReactNode } from "react";

// The record, by industry. One row per system. No numbering: rows are peers.
// Status is printed as it is and audited against Linear/Mycel on the date in
// index.tsx. Three values only.
export type Status = "running" | "pilot" | "building";

export type LedgerRow = {
  name: string;
  detail: ReactNode;
  status: Status;
};

export type LedgerGroup = {
  industry: string;
  context: string;
  rows: LedgerRow[];
};

const STATUS_LABEL: Record<Status, string> = {
  running: "Running",
  pilot: "Pilot",
  building: "Building",
};

function StatusTag({ status }: { status: Status }) {
  const tone =
    status === "running"
      ? "border-snow text-snow"
      : status === "pilot"
        ? "border-snow/60 text-snow/80"
        : "border-snow/30 text-snow/60";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 border px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em] ${tone}`}
    >
      <span
        aria-hidden
        className={`inline-block h-[6px] w-[6px] ${
          status === "running" ? "bg-snow" : status === "pilot" ? "bg-snow/60" : "bg-transparent border border-snow/50"
        }`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Ledger({ groups }: { groups: LedgerGroup[] }) {
  return (
    <div className="divide-y divide-snow/20 border-t border-snow/20">
      {groups.map((g) => (
        <section key={g.industry} className="grid grid-cols-1 gap-6 py-10 md:grid-cols-[0.34fr_1fr] md:gap-12 md:py-12">
          <div>
            <h3 className="font-editorial text-[26px] uppercase leading-[0.95] tracking-tight text-snow md:text-[30px]">
              {g.industry}
            </h3>
            <p className="mt-3 max-w-[30ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-snow/60">
              {g.context}
            </p>
          </div>
          <ul className="divide-y divide-snow/10 border-t border-snow/10 md:border-t-0">
            {g.rows.map((r) => (
              <li
                key={r.name}
                className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6"
              >
                <div>
                  <p className="text-[15px] leading-snug text-snow">{r.name}</p>
                  <p className="mt-1 max-w-[62ch] text-[13.5px] leading-[1.6] text-snow/70">{r.detail}</p>
                </div>
                <StatusTag status={r.status} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
