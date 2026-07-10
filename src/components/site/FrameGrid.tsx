import type { ReactNode } from "react";

export function FrameGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
      {children}
    </div>
  );
}

type FrameCellProps = {
  number: string;
  name: string;
  outcome: string;
  art: string;
};

export function FrameCell({ number, name, outcome, art }: FrameCellProps) {
  return (
    <div className="group flex flex-col">
      <div className="flex items-center border-t border-snow/20 pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-snow/60">
          #{number}
        </span>
      </div>
      <h3 className="mt-4 flex min-h-[2.1em] items-start font-editorial text-[26px] uppercase leading-[0.95] tracking-tight text-snow md:text-[30px]">
        {name}
      </h3>
      <div className="mt-6 aspect-video w-full overflow-hidden">
        <img src={art} alt="" aria-hidden className="art-invert h-full w-full object-cover" />
      </div>
      <p className="mt-5 min-h-[3.3em] font-mono text-[11px] uppercase leading-relaxed tracking-[0.04em] text-snow/70">
        {outcome}
      </p>
    </div>
  );
}
