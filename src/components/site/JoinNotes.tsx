import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const notes = [
  "Write it straight. We can tell when it's inflated.",
  "We're not scoring grammar.",
  "One true answer beats three polished ones.",
  "Talk like you would to someone who builds. Not like you're applying for a job.",
  "No resume needed. We're not reading one.",
  "Every answer gets read. Not skimmed, read.",
  "There are no keywords to hit. Just answer the question.",
  "We care how you think. Not where you studied.",
];

// Center-focus depth-of-field: blur is driven by each phrase's live distance
// from the vertical center of the viewport, not by scroll-linked enter/exit
// lifecycles. A band around screen-center stays sharp; phrases further from
// it blur in gradually (smoothstep), capped at MAX_BLUR_PX.
const SHARP_ZONE_FRACTION = 0.16; // half-width of the sharp band, as a fraction of viewport height (~32% total)
const FALLOFF_FRACTION = 0.42; // distance (as a fraction of viewport height) beyond the sharp zone over which blur ramps to max
const MAX_BLUR_PX = 5;
const MIN_OPACITY = 0.55;

function smoothstep(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

type JoinNoteItemProps = {
  note: string;
  isStatic: boolean;
  registerRef: (el: HTMLLIElement | null) => void;
};

function JoinNoteItem({ note, isStatic, registerRef }: JoinNoteItemProps) {
  const style = isStatic ? { opacity: 1, filter: "none" } : undefined;

  return (
    <li
      ref={registerRef}
      style={style}
      className="font-mono text-[12.5px] leading-relaxed text-graphite [will-change:filter,opacity]"
    >
      {note}
    </li>
  );
}

export function JoinNotes() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isStatic = !mounted || Boolean(reduceMotion);

  useEffect(() => {
    if (isStatic) return;

    const update = () => {
      rafRef.current = null;
      const viewportHeight = window.innerHeight;
      const viewportCenterY = viewportHeight / 2;
      const sharpZone = SHARP_ZONE_FRACTION * viewportHeight;
      const falloff = FALLOFF_FRACTION * viewportHeight;

      for (const el of itemRefs.current) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const elementCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenterY - viewportCenterY);
        const beyond = Math.max(0, distance - sharpZone);
        const t = falloff > 0 ? beyond / falloff : 0;
        const eased = smoothstep(t);

        const blur = eased * MAX_BLUR_PX;
        const opacity = 1 - eased * (1 - MIN_OPACITY);

        el.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none";
        el.style.opacity = opacity.toFixed(3);
      }
    };

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isStatic]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col border-t border-ink/15 pt-8">
      <span aria-hidden className="mb-6 block h-6 w-px bg-ink/25" />
      <ul className="flex h-full min-h-0 flex-1 flex-col justify-between gap-10 md:gap-12">
        {notes.map((note, index) => (
          <JoinNoteItem
            key={note}
            note={note}
            isStatic={isStatic}
            registerRef={(el) => {
              itemRefs.current[index] = el;
            }}
          />
        ))}
      </ul>
    </div>
  );
}
