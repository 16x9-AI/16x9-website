import { useEffect, useRef, useState, type HTMLAttributes } from "react";

/**
 * Has this element scrolled into view? Content is never hidden: the server renders it in place,
 * and only elements that start below the fold get the entrance motion. Reduced motion skips it.
 * No animation library, so nothing heavy ships on first load.
 */
export function useEntrance<T extends HTMLElement>(margin = "-80px") {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"idle" | "waiting" | "shown">("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: no motion
    setState("waiting");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: `0px 0px ${margin} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, state };
}

type Props = HTMLAttributes<HTMLDivElement> & { delay?: number };

// Content is visible from the first server-rendered paint; only the position eases in.
// It used to start at opacity 0 through framer-motion, which hid server-rendered text until
// JavaScript loaded: a 5.0 s LCP on a throttled phone (PR #4 preview trace, 2026-11-02).
export function Reveal({ delay = 0, style, children, ...rest }: Props) {
  const { ref, state } = useEntrance<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        ...style,
        transform: state === "waiting" ? "translateY(14px)" : undefined,
        transition:
          state === "shown" ? `transform 350ms cubic-bezier(0, 1, 0.25, 1) ${delay}s` : undefined,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
