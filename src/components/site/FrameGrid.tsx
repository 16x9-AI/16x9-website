import type { ReactNode } from "react";

export function FrameGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
      {children}
    </div>
  );
}

// Status is the only tag a card carries. Three values, printed as they are
// (VOICE.md). No numbering: the six cards are peers.
export type CardStatus = "Running" | "Pilot" | "Building";

type FrameCellProps = {
  status: CardStatus;
  name: string;
  outcome: ReactNode;
  art: string;
};

export function FrameCell({ status, name, outcome, art }: FrameCellProps) {
  const dot =
    status === "Running" ? "bg-snow" : status === "Pilot" ? "bg-snow/50" : "border border-snow/50";
  return (
    <div className="group flex flex-col">
      <div className="flex items-center gap-2 border-t border-snow/20 pt-4">
        <span aria-hidden className={`inline-block h-[6px] w-[6px] ${dot}`} />
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-snow/60">
          {status}
        </span>
      </div>
      <h3 className="mt-4 flex min-h-[2.1em] items-start font-editorial text-[26px] uppercase leading-[0.95] tracking-tight text-snow md:text-[30px]">
        {name}
      </h3>
      <div className="mt-6 aspect-video w-full overflow-hidden">
        <img src={art} alt="" aria-hidden className="art-invert h-full w-full object-cover" />
      </div>
      <p className="mt-5 text-[13.5px] leading-[1.6] text-snow/75">{outcome}</p>
    </div>
  );
}
