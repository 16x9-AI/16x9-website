import type { ReactNode } from "react";

/**
 * FrameShell: the structural echo of the brand, built as a real
 * passe-partout. Four opaque bars matching the page background sit fixed
 * above the content on all four edges, masking it like physical matting -
 * headlines scroll under the bars and disappear cleanly instead of being
 * sliced by a hairline. A 1px hairline sits at the matting's inner edge.
 *
 * The bottom padding on the wrapper reserves space at the true end of the
 * document so the final content (footer) can clear the fixed bottom bar
 * instead of being permanently covered by it.
 */
export function FrameShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] pb-4 md:pb-6">
      {children}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
        <div className="absolute inset-x-0 top-0 h-4 bg-background md:h-6" />
        <div className="absolute inset-x-0 bottom-0 h-4 bg-background md:h-6" />
        <div className="absolute inset-y-0 left-0 w-4 bg-background md:w-6" />
        <div className="absolute inset-y-0 right-0 w-4 bg-background md:w-6" />
        <div className="absolute inset-4 border border-ink/80 md:inset-6" />
      </div>
    </div>
  );
}
