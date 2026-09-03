import { useEffect, useRef } from "react";

/**
 * Motif: the site's illustrations, drawn live. Each kind is a small
 * generative piece in the same monochrome, hairline language as the static
 * SVG art it replaces, rendered on a canvas that fills its parent box and
 * paints in the parent's current text colour (text-ink on the light page,
 * text-snow on the dark plate).
 *
 * Rules the whole family follows:
 * - Deterministic composition. Every frame re-seeds the same generator, so
 *   layout is stable and only the time term moves.
 * - Slow. Nothing here should read as an animation; it should read as a
 *   thing that is quietly alive when you look twice.
 * - Cheap. Frames are capped near 30 fps, the loop pauses when the box is
 *   off screen, and every motif is a few hundred primitives at most.
 * - prefers-reduced-motion draws one still frame and stops.
 * - Server renders an empty canvas with identical attributes, so hydration
 *   never mismatches.
 */
export type MotifKind =
  "dots" | "field" | "filmstrip" | "waves" | "contours" | "lines" | "horizon" | "wideshot";

type Rnd = () => number;
type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rnd: Rnd) => void;

function mulberry32(seed: number): Rnd {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS: Record<MotifKind, number> = {
  dots: 1601,
  field: 2417,
  filmstrip: 3301,
  waves: 4409,
  contours: 5501,
  lines: 6607,
  horizon: 7703,
  wideshot: 8809,
};

function alpha(ctx: CanvasRenderingContext2D, a: number) {
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
}

/** Dot lattice with a breathing bright region, corner brackets, a drifting reticle. */
const dots: Draw = (ctx, w, h, t, rnd) => {
  const s = Math.max(7, Math.min(w, h) / 20);
  // the bright region wanders on a ~14 s orbit and breathes on a ~5 s cycle
  const cx = w * (0.6 + 0.14 * Math.sin(t * 0.45));
  const cy = h * (0.45 + 0.16 * Math.cos(t * 0.31));
  const sigma = Math.min(w, h) * (0.2 + 0.06 * Math.sin(t * 1.25));
  for (let y = s; y < h - s * 0.5; y += s) {
    for (let x = s; x < w - s * 0.5; x += s) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      const bump = Math.exp(-d2 / (2 * sigma * sigma));
      const grain = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.7 + rnd() * Math.PI * 2));
      alpha(ctx, (0.1 + 0.85 * bump) * grain);
      const r = 0.7 + 1.5 * bump;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // corner brackets
  alpha(ctx, 0.9);
  ctx.lineWidth = 1;
  const m = s * 0.9;
  const L = s * 1.6;
  for (const [sx, sy] of [
    [m, m],
    [w - m, m],
    [m, h - m],
    [w - m, h - m],
  ] as const) {
    const dx = sx < w / 2 ? 1 : -1;
    const dy = sy < h / 2 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(sx, sy + dy * L);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx + dx * L, sy);
    ctx.stroke();
  }
  // reticle, tracking a point the bright region never quite reaches (~9 s)
  const rx = w * (0.34 + 0.06 * Math.cos(t * 0.7));
  const ry = h * (0.55 + 0.08 * Math.sin(t * 0.55));
  const rr = s * 1.1;
  alpha(ctx, 0.85);
  ctx.beginPath();
  ctx.arc(rx, ry, rr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rx - rr * 1.6, ry);
  ctx.lineTo(rx + rr * 1.6, ry);
  ctx.moveTo(rx, ry - rr * 1.6);
  ctx.lineTo(rx, ry + rr * 1.6);
  ctx.stroke();
  alpha(ctx, 1);
};

/** Dense point cloud with a slowly orbiting core; points twinkle in place. */
const field: Draw = (ctx, w, h, t, rnd) => {
  const n = Math.round(Math.min(900, (w * h) / 70));
  // the core orbits on a ~12 s loop; each point twinkles on its own phase and
  // drifts a few pixels, so the cloud reads as a slow, living field
  const cx = w * (0.55 + 0.16 * Math.cos(t * 0.5));
  const cy = h * (0.45 + 0.18 * Math.sin(t * 0.37));
  const sigma = Math.min(w, h) * (0.28 + 0.05 * Math.sin(t * 0.9));
  for (let i = 0; i < n; i++) {
    const phase = rnd() * Math.PI * 2;
    const x = rnd() * w + 3 * Math.sin(t * 0.6 + phase);
    const y = rnd() * h + 2 * Math.cos(t * 0.45 + phase * 1.3);
    const d2 = (x - cx) ** 2 + (y - cy) ** 2;
    const bump = Math.exp(-d2 / (2 * sigma * sigma));
    const twinkle = 0.55 + 0.45 * Math.sin(t * 1.4 + phase);
    alpha(ctx, (0.06 + 0.9 * bump) * twinkle);
    const r = 0.8 + 1.3 * bump;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  alpha(ctx, 1);
};

/** Five film frames with sprocket holes; the grain inside advances like film. */
const filmstrip: Draw = (ctx, w, h, t, rnd) => {
  const frames = 5;
  const gutter = Math.max(3, w * 0.012);
  const sprocket = Math.max(4, h * 0.07);
  const fw = (w - gutter * (frames + 1)) / frames;
  const top = sprocket + gutter;
  const fh = h - 2 * (sprocket + gutter);
  ctx.lineWidth = 1;
  // sprocket holes
  alpha(ctx, 0.55);
  const hole = Math.max(2, sprocket * 0.45);
  for (let x = gutter; x < w - hole; x += hole * 2.2) {
    ctx.strokeRect(x, sprocket * 0.28, hole, hole);
    ctx.strokeRect(x, h - sprocket * 0.28 - hole, hole, hole);
  }
  const advance = (t * 5) % fh;
  for (let f = 0; f < frames; f++) {
    const x0 = gutter + f * (fw + gutter);
    alpha(ctx, 0.7);
    ctx.strokeRect(x0 + 0.5, top + 0.5, fw - 1, fh - 1);
    // grain: density rises to the right, brightness rises to the bottom
    const count = Math.round(40 + f * 45);
    for (let i = 0; i < count; i++) {
      const gx = x0 + 2 + rnd() * (fw - 4);
      const gy0 = rnd() * fh;
      const gy = top + ((gy0 + advance) % fh);
      const bright = 0.15 + 0.75 * ((gy - top) / fh) * (0.5 + 0.5 * rnd());
      alpha(ctx, bright);
      ctx.beginPath();
      ctx.arc(gx, gy, 0.8 + 0.7 * rnd(), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  alpha(ctx, 1);
};

/** Layered horizontal waves drifting at different speeds, one true horizon. */
const waves: Draw = (ctx, w, h, t, rnd) => {
  ctx.lineWidth = 0.9;
  const count = 9;
  for (let i = 0; i < count; i++) {
    const y0 = h * (0.12 + (i / (count - 1)) * 0.76);
    const amp = h * (0.03 + 0.04 * rnd());
    const k = (2 + 3 * rnd()) / w;
    const speed = 0.12 + 0.18 * rnd();
    const phase = rnd() * Math.PI * 2;
    alpha(ctx, 0.35 + 0.5 * rnd());
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y =
        y0 +
        amp * Math.sin(x * k * Math.PI * 2 + phase + t * speed) +
        amp * 0.35 * Math.sin(x * k * Math.PI * 5 - t * speed * 1.7);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // the one straight line
  alpha(ctx, 0.9);
  ctx.lineWidth = 1.2;
  const hy = h * 0.56;
  ctx.beginPath();
  ctx.moveTo(0, hy);
  ctx.lineTo(w, hy);
  ctx.stroke();
  alpha(ctx, 1);
};

/** Concentric contour rings, each ring slowly morphing and turning. */
const contours: Draw = (ctx, w, h, t, rnd) => {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const rings = 9;
  const maxR = Math.min(w, h) * 0.46;
  ctx.lineWidth = 0.9;
  for (let k = 0; k < rings; k++) {
    const base = (maxR * (k + 1)) / rings;
    const p1 = rnd() * Math.PI * 2;
    const p2 = rnd() * Math.PI * 2;
    const a1 = 0.08 + 0.08 * rnd();
    const a2 = 0.03 + 0.04 * rnd();
    alpha(ctx, 0.35 + 0.5 * (1 - k / rings));
    ctx.beginPath();
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const r =
        base *
        (1 +
          a1 * Math.sin(3 * th + p1 + t * 0.12 * (1 + k * 0.08)) +
          a2 * Math.sin(7 * th + p2 - t * 0.09));
      const x = cx + r * Math.cos(th) * 1.18;
      const y = cy + r * Math.sin(th) * 0.8;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  // the centre mark
  alpha(ctx, 0.9);
  ctx.beginPath();
  ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
  ctx.fill();
  alpha(ctx, 1);
};

/** Ruled lines of word-length dashes scrolling at reading speed; a bold band breathes. */
const lines: Draw = (ctx, w, h, t, rnd) => {
  const gap = Math.max(6, h / 26);
  const rows = Math.floor((h - gap) / gap);
  const bandStart = Math.floor(rows * 0.42);
  const bandEnd = bandStart + 3;
  const scroll = t * 6;
  for (let r = 0; r < rows; r++) {
    const y = gap + r * gap;
    const inBand = r >= bandStart && r < bandEnd;
    ctx.lineWidth = inBand ? 2 : 0.9;
    const breathe = inBand ? 0.7 + 0.3 * Math.sin(t * 0.5) : 1;
    alpha(ctx, (inBand ? 0.85 : 0.45) * breathe);
    // dashes: a seeded sequence of word-like segments, period = 2w so the scroll wraps
    let x = -((scroll * (0.6 + 0.8 * rnd())) % (2 * w));
    ctx.beginPath();
    while (x < w) {
      const seg = 6 + rnd() * 34;
      const space = 4 + rnd() * 10;
      if (x + seg > 0) {
        ctx.moveTo(Math.max(0, x), y);
        ctx.lineTo(Math.min(w, x + seg), y);
      }
      x += seg + space;
    }
    ctx.stroke();
  }
  alpha(ctx, 1);
};

/** A dotted horizon whose dots swell and settle like a slow signal. */
const horizon: Draw = (ctx, w, h, t, rnd) => {
  const y = h * 0.55;
  const step = Math.max(10, w / 90);
  for (let x = step * 0.5; x < w; x += step) {
    const n = rnd();
    const sig = 0.5 + 0.5 * Math.sin(x * 0.015 + t * 0.45 + n * 2);
    const r = 0.8 + 3.2 * sig * (0.6 + 0.4 * n);
    alpha(ctx, 0.55 + 0.45 * sig);
    ctx.beginPath();
    ctx.arc(x, y + (n - 0.5) * h * 0.25 * (1 - sig), r, 0, Math.PI * 2);
    ctx.fill();
    // a faint echo row
    if (n > 0.6) {
      alpha(ctx, 0.25);
      ctx.beginPath();
      ctx.arc(x + step * 0.4, y + h * 0.28, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  alpha(ctx, 1);
};

/**
 * The wide shot. A dot field under a 16:9 frame; a crop keeps narrowing to a
 * tight frame and opening back out to the full width, dimming everything it
 * leaves outside. A frame is a decision about what to include.
 */
const wideshot: Draw = (ctx, w, h, t, rnd) => {
  const m = Math.max(10, Math.min(w, h) * 0.08);
  const fx = m;
  const fy = m;
  const fw = w - 2 * m;
  const fh = h - 2 * m;
  // crop factor: holds at wide, closes to ~55%, holds, opens (period ~16 s)
  const raw = 0.5 + 0.5 * Math.cos(t * 0.39);
  const eased = raw * raw * (3 - 2 * raw);
  const f = 0.55 + 0.45 * eased;
  const cw = fw * f;
  const ch = fh * (0.72 + 0.28 * eased);
  const cx0 = fx + (fw - cw) * (0.5 + 0.18 * Math.sin(t * 0.21));
  const cy0 = fy + (fh - ch) / 2;
  // the field, with a bright region panning slowly across the frame
  const s = Math.max(6, Math.min(w, h) / 24);
  const bx = fx + fw * (0.5 + 0.32 * Math.sin(t * 0.27));
  const by = fy + fh * (0.5 + 0.2 * Math.cos(t * 0.19));
  const sigma = Math.min(fw, fh) * 0.28;
  for (let y = fy + s; y < fy + fh - s * 0.4; y += s) {
    for (let x = fx + s; x < fx + fw - s * 0.4; x += s) {
      const d2 = (x - bx) ** 2 + (y - by) ** 2;
      const bump = Math.exp(-d2 / (2 * sigma * sigma));
      const inside = x >= cx0 && x <= cx0 + cw && y >= cy0 && y <= cy0 + ch;
      const grain = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.3 + rnd() * Math.PI * 2));
      alpha(ctx, (0.08 + 0.85 * bump) * grain * (inside ? 1 : 0.22));
      ctx.beginPath();
      ctx.arc(x, y, 0.7 + 1.4 * bump, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.lineWidth = 1;
  // the full 16:9 frame, faint
  alpha(ctx, 0.35);
  ctx.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1);
  // the crop: hairline plus corner brackets
  alpha(ctx, 0.95);
  ctx.strokeRect(cx0 + 0.5, cy0 + 0.5, cw - 1, ch - 1);
  const L = s * 1.4;
  for (const [sx, sy, dx, dy] of [
    [cx0, cy0, 1, 1],
    [cx0 + cw, cy0, -1, 1],
    [cx0, cy0 + ch, 1, -1],
    [cx0 + cw, cy0 + ch, -1, -1],
  ] as const) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy + dy * L);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx + dx * L, sy);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
  // reticle on the bright region, only when it sits inside the crop
  const inCrop = bx >= cx0 && bx <= cx0 + cw && by >= cy0 && by <= cy0 + ch;
  alpha(ctx, inCrop ? 0.9 : 0.3);
  const rr = s * 0.9;
  ctx.beginPath();
  ctx.arc(bx, by, rr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx - rr * 1.6, by);
  ctx.lineTo(bx + rr * 1.6, by);
  ctx.moveTo(bx, by - rr * 1.6);
  ctx.lineTo(bx, by + rr * 1.6);
  ctx.stroke();
  // the ratio readout, live
  alpha(ctx, 0.75);
  ctx.font = `${Math.max(9, s * 0.9)}px "Geist Mono Variable", ui-monospace, monospace`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const ratio = (cw / ch).toFixed(2);
  ctx.fillText(`F / ${ratio}:1`, fx + 2, fy + fh + m * 0.72);
  alpha(ctx, 1);
};

const DRAW: Record<MotifKind, Draw> = {
  dots,
  field,
  filmstrip,
  waves,
  contours,
  lines,
  horizon,
  wideshot,
};

export function Motif({ kind, className = "" }: { kind: MotifKind; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seed = SEEDS[kind];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    let last = 0;
    const t0 = performance.now();

    const frame = () => {
      const t = reduce ? 0 : (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ctx.strokeStyle = getComputedStyle(canvas).color;
      DRAW[kind](ctx, w, h, t, mulberry32(seed));
    };

    const loop = (now: number) => {
      if (!visible || reduce) return;
      if (now - last >= 33) {
        last = now;
        frame();
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      frame();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        start();
      },
      { rootMargin: "120px" },
    );
    io.observe(parent);
    resize();

    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [kind]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
