import { lazy, Suspense, useEffect, useRef, useState } from "react";

// The Mycel canvas (and the animation library it uses) loads only when its box scrolls near the
// screen. On phones the box is display:none, so it never loads there at all. Keeps framer-motion
// out of the first-load bundle (PR #4 performance pass, 2026-11-02).
const MycelBrain = lazy(() =>
  import("@/components/site/MycelBrain").then((m) => ({ default: m.MycelBrain })),
);

export function DeferredMycelBrain() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="h-full w-full">
      {near && (
        <Suspense fallback={null}>
          <MycelBrain />
        </Suspense>
      )}
    </div>
  );
}
