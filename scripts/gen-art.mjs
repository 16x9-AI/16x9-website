// Procedural, deterministic B/W poster-art generator for the Experiments grid.
// Produces risograph/halftone-style SVGs into src/assets/art/. No dependencies.
// Run: node scripts/gen-art.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "src", "assets", "art");
mkdirSync(OUT_DIR, { recursive: true });

const W = 800;
const H = 450; // 16:9

// --- deterministic PRNG (mulberry32) ---
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function svgWrap(body, { bg = "none" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">
<rect x="0" y="0" width="${W}" height="${H}" fill="${bg}"/>
${body}
</svg>
`;
}

/**
 * 1. Halftone dot-gradient field.
 * A grid of dots whose radius is driven by a field function (radial falloff
 * from a focal point plus mild seeded jitter), like a dithered sky/horizon.
 */
function halftoneField(seed, { focal = [0.5, 0.35], maxR = 6.2, invert = false } = {}) {
  const rnd = mulberry32(seed);
  const cols = 46;
  const rows = 26;
  const cellW = W / cols;
  const cellH = H / rows;
  const fx = focal[0] * W;
  const fy = focal[1] * H;
  const maxDist = Math.hypot(Math.max(fx, W - fx), Math.max(fy, H - fy));
  let dots = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jitterX = (rnd() - 0.5) * cellW * 0.35;
      const jitterY = (rnd() - 0.5) * cellH * 0.35;
      const cx = c * cellW + cellW / 2 + jitterX;
      const cy = r * cellH + cellH / 2 + jitterY;
      const dist = Math.hypot(cx - fx, cy - fy) / maxDist;
      let t = invert ? dist : 1 - dist;
      t = Math.max(0, Math.min(1, t));
      // Ease so the falloff reads as print dot-gain, not linear.
      t = t * t;
      const radius = t * maxR + rnd() * 0.4;
      if (radius < 0.15) continue;
      dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(2)}" fill="#0a0a0a"/>`;
    }
  }
  return svgWrap(dots, { bg: "#ffffff" });
}

/**
 * 2. Wireframe panoramic landscape.
 * Stacked contour ridgelines (mountains as line topography) receding toward
 * a horizon, each line built from seeded sine-noise perturbation.
 */
function wireframeLandscape(seed, { lines = 9, horizonY = 0.62 } = {}) {
  const rnd = mulberry32(seed);
  const hY = H * horizonY;
  let paths = "";
  // sky: sparse horizontal scanlines above horizon
  for (let i = 0; i < 5; i++) {
    const y = (hY / 6) * i + 6;
    paths += `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="#0a0a0a" stroke-width="0.6" opacity="${(0.15 + i * 0.03).toFixed(2)}"/>`;
  }
  // ridgelines, each nearer + taller than the last
  for (let i = 0; i < lines; i++) {
    const depth = i / (lines - 1); // 0 = farthest, 1 = nearest
    const baseY = hY - depth * depth * (H * 0.5) - 4;
    const amp = 10 + depth * 70;
    const freq = 2 + rnd() * 2.4;
    const phase = rnd() * Math.PI * 2;
    const points = [];
    const steps = 64;
    for (let s = 0; s <= steps; s++) {
      const x = (W / steps) * s;
      const n =
        Math.sin((s / steps) * Math.PI * freq + phase) * 0.6 +
        Math.sin((s / steps) * Math.PI * freq * 2.7 + phase * 1.7) * 0.4;
      const y = baseY - Math.abs(n) * amp;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const strokeW = (0.7 + depth * 1.3).toFixed(2);
    const opacity = (0.35 + depth * 0.65).toFixed(2);
    paths += `<polyline points="${points.join(" ")}" fill="none" stroke="#0a0a0a" stroke-width="${strokeW}" opacity="${opacity}"/>`;
  }
  // horizon line, full weight
  paths += `<line x1="0" y1="${hY.toFixed(1)}" x2="${W}" y2="${hY.toFixed(1)}" stroke="#0a0a0a" stroke-width="1.4"/>`;
  return svgWrap(paths, { bg: "#ffffff" });
}

/**
 * Shared helper: a halftone dot layer scoped to a region, used as print
 * texture underneath/inside diagram pieces so they read as risograph
 * artwork rather than line clipart.
 */
function halftoneLayer(
  rnd,
  {
    focal = [0.5, 0.5],
    maxR = 2.6,
    cols = 60,
    rows = 34,
    opacity = 0.55,
    x0 = 0,
    y0 = 0,
    w = W,
    h = H,
    invert = false,
  } = {},
) {
  const cellW = w / cols;
  const cellH = h / rows;
  const fx = x0 + focal[0] * w;
  const fy = y0 + focal[1] * h;
  const maxDist = Math.hypot(Math.max(fx - x0, x0 + w - fx), Math.max(fy - y0, y0 + h - fy));
  let dots = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x0 + c * cellW + cellW / 2 + (rnd() - 0.5) * cellW * 0.3;
      const cy = y0 + r * cellH + cellH / 2 + (rnd() - 0.5) * cellH * 0.3;
      const dist = Math.hypot(cx - fx, cy - fy) / maxDist;
      let t = invert ? dist : 1 - dist;
      t = Math.max(0, Math.min(1, t));
      t = t * t;
      const radius = t * maxR;
      if (radius < 0.18) continue;
      dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(2)}" fill="#0a0a0a" opacity="${opacity}"/>`;
    }
  }
  return dots;
}

/**
 * 3. Viewfinder / optical diagram.
 * Frame corner brackets, a crosshair, focal marks, and an aspect-ratio
 * readout, drawn over a halftone light-field so the piece reads like a
 * viewfinder metering a bright scene.
 */
function viewfinderDiagram(seed, { label = "16 × 9" } = {}) {
  const rnd = mulberry32(seed);
  const pad = 46;
  const cornerLen = 34;
  const cx = W / 2;
  const cy = H / 2;
  const corners = [
    [pad, pad, 1, 1],
    [W - pad, pad, -1, 1],
    [pad, H - pad, 1, -1],
    [W - pad, H - pad, -1, -1],
  ];
  let marks = "";
  // halftone light-field behind the diagram, focal off-center upper-right
  marks += halftoneLayer(rnd, {
    focal: [0.68, 0.3],
    maxR: 3.1,
    cols: 64,
    rows: 36,
    opacity: 0.42,
    x0: pad,
    y0: pad,
    w: W - pad * 2,
    h: H - pad * 2,
  });
  for (const [x, y, dx, dy] of corners) {
    marks += `<path d="M ${x} ${y + dy * cornerLen} L ${x} ${y} L ${x + dx * cornerLen} ${y}" fill="none" stroke="#0a0a0a" stroke-width="2.2"/>`;
  }
  // crosshair
  marks += `<line x1="${cx - 22}" y1="${cy}" x2="${cx + 22}" y2="${cy}" stroke="#0a0a0a" stroke-width="1.4"/>`;
  marks += `<line x1="${cx}" y1="${cy - 22}" x2="${cx}" y2="${cy + 22}" stroke="#0a0a0a" stroke-width="1.4"/>`;
  marks += `<circle cx="${cx}" cy="${cy}" r="46" fill="none" stroke="#0a0a0a" stroke-width="1" opacity="0.5"/>`;
  marks += `<circle cx="${cx}" cy="${cy}" r="3" fill="#0a0a0a"/>`;
  // seeded scatter of focal tick marks along the frame edges
  for (let i = 0; i < 10; i++) {
    const onTop = rnd() > 0.5;
    const x = pad + rnd() * (W - pad * 2);
    const y = onTop ? pad - 10 : H - pad + 10;
    marks += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + (onTop ? 6 : -6)).toFixed(1)}" stroke="#0a0a0a" stroke-width="1" opacity="0.7"/>`;
  }
  // aspect ratio guide rectangle, centered, thin
  const gw = W - pad * 2.6;
  const gh = gw * (9 / 16);
  marks += `<rect x="${(cx - gw / 2).toFixed(1)}" y="${(cy - gh / 2).toFixed(1)}" width="${gw.toFixed(1)}" height="${gh.toFixed(1)}" fill="none" stroke="#0a0a0a" stroke-width="0.8" stroke-dasharray="2 6" opacity="0.6"/>`;
  marks += `<text x="${pad}" y="${H - 18}" font-family="ui-monospace, monospace" font-size="13" letter-spacing="2" fill="#0a0a0a">${label}</text>`;
  return svgWrap(marks, { bg: "#ffffff" });
}

/**
 * 4. Film-strip / frame-sequence geometry.
 * A row of frames with sprocket ticks along the top and bottom, each frame
 * carrying a distinct dither density to suggest a sequence advancing.
 */
function filmStrip(seed, { frames = 5 } = {}) {
  const rnd = mulberry32(seed);
  const margin = 18;
  const trackH = 26;
  const frameW = (W - margin * 2) / frames;
  const frameH = H - margin * 2 - trackH * 2;
  let body = "";
  // sprocket ticks
  for (let band of [margin, H - margin - trackH]) {
    for (let x = margin; x < W - margin; x += 16) {
      body += `<rect x="${x.toFixed(1)}" y="${(band + trackH / 2 - 4).toFixed(1)}" width="7" height="8" fill="none" stroke="#0a0a0a" stroke-width="1"/>`;
    }
  }
  for (let i = 0; i < frames; i++) {
    const x0 = margin + i * frameW;
    const y0 = margin + trackH;
    body += `<rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${frameW.toFixed(1)}" height="${frameH.toFixed(1)}" fill="none" stroke="#0a0a0a" stroke-width="1.4"/>`;
    // per-frame halftone exposure: the light source travels across the
    // sequence and each frame is denser than the last (developing print)
    const t = frames > 1 ? i / (frames - 1) : 0;
    body += halftoneLayer(rnd, {
      focal: [0.15 + t * 0.7, 0.3 + t * 0.35],
      maxR: 1.9 + t * 1.7,
      cols: 16,
      rows: 34,
      opacity: 0.55 + t * 0.3,
      x0: x0 + 5,
      y0: y0 + 5,
      w: frameW - 10,
      h: frameH - 10,
    });
    body += `<text x="${(x0 + 6).toFixed(1)}" y="${(y0 + frameH - 6).toFixed(1)}" font-family="ui-monospace, monospace" font-size="10" fill="#0a0a0a" opacity="0.55">${String(i + 1).padStart(2, "0")}</text>`;
  }
  return svgWrap(body, { bg: "#ffffff" });
}

/**
 * 5. Scanline horizon: halftone field compressed toward a horizon band with
 * horizontal scanline texture, used for "concluded" experiments (a fading,
 * settled read rather than an active radiant field).
 */
function scanlineHorizon(seed, { horizonY = 0.5 } = {}) {
  const rnd = mulberry32(seed);
  const hY = H * horizonY;
  let body = "";
  const rows = 30;
  for (let r = 0; r < rows; r++) {
    const y = (H / rows) * r + H / rows / 2;
    const distFromHorizon = Math.abs(y - hY) / (H / 2);
    const density = Math.max(0, 1 - distFromHorizon * 1.15);
    if (density <= 0) continue;
    const step = 6 + (1 - density) * 22;
    for (let x = 4; x < W - 4; x += step) {
      const len = 3 + density * 14 + rnd() * 3;
      const jitter = (rnd() - 0.5) * 2;
      body += `<line x1="${x.toFixed(1)}" y1="${(y + jitter).toFixed(1)}" x2="${(x + len).toFixed(1)}" y2="${(y + jitter).toFixed(1)}" stroke="#0a0a0a" stroke-width="1" opacity="${(0.25 + density * 0.55).toFixed(2)}"/>`;
    }
  }
  body += `<line x1="0" y1="${hY.toFixed(1)}" x2="${W}" y2="${hY.toFixed(1)}" stroke="#0a0a0a" stroke-width="1.2" opacity="0.85"/>`;
  return svgWrap(body, { bg: "#ffffff" });
}

/**
 * 6. Topography blueprint: layered contour-line "map" (mountains seen from
 * above), used to suggest a build/pipeline blueprint.
 */
function topographyBlueprint(seed, { rings = 7 } = {}) {
  const rnd = mulberry32(seed);
  const cx = W * (0.4 + rnd() * 0.2);
  const cy = H * (0.45 + rnd() * 0.15);
  let body = "";
  for (let i = rings; i >= 1; i--) {
    const rBase = (i / rings) * (Math.min(W, H) * 0.62);
    const points = [];
    const steps = 72;
    for (let s = 0; s <= steps; s++) {
      const a = (s / steps) * Math.PI * 2;
      const wobble =
        Math.sin(a * 3 + i * 1.3 + rnd() * 0.5) * (6 + i * 2) +
        Math.sin(a * 7 + i) * (2 + i);
      const r = rBase + wobble;
      points.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r * 0.62).toFixed(1)}`);
    }
    const opacity = (0.3 + (rings - i) * 0.09).toFixed(2);
    body += `<polygon points="${points.join(" ")}" fill="none" stroke="#0a0a0a" stroke-width="${(0.7 + (rings - i) * 0.1).toFixed(2)}" opacity="${opacity}"/>`;
  }
  body += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.4" fill="#0a0a0a"/>`;
  // crosshair ticks marking the survey point
  body += `<line x1="${(cx - 12).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + 12).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#0a0a0a" stroke-width="1"/>`;
  body += `<line x1="${cx.toFixed(1)}" y1="${(cy - 12).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy + 12).toFixed(1)}" stroke="#0a0a0a" stroke-width="1"/>`;
  return svgWrap(body, { bg: "#ffffff" });
}

/**
 * 7. Mycelium network field.
 * An organic node-and-filament network: many small nodes of varying size,
 * connected by thin curving threads, denser and thicker around a few hub
 * nodes (like a mycelial network radiating from fruiting bodies). Tuned to
 * read as a print/dither diagram, not a generic tech "network graph" -
 * filaments curve (quadratic beziers with organic control-point jitter),
 * nodes vary continuously in size rather than in two discrete tiers, and a
 * faint halftone dust field sits behind everything for texture.
 */
function myceliumNetwork(seed, { hubs = 3, nodes = 130, labels = [] } = {}) {
  const rnd = mulberry32(seed);
  const pad = 20;

  // Place hub nodes stratified across the full 16:9 field: one hub per
  // horizontal band, alternating between the upper and lower halves of the
  // canvas (with seeded jitter) so the composition fills the whole frame by
  // construction rather than by random luck.
  const hubPts = [];
  const bandW = (W - pad * 2) / hubs;
  for (let i = 0; i < hubs; i++) {
    const x = pad + bandW * (i + 0.2 + rnd() * 0.6);
    const [y0, y1] = i % 2 === 0 ? [0.14, 0.42] : [0.58, 0.86];
    const y = H * (y0 + rnd() * (y1 - y0));
    hubPts.push([x, y]);
  }

  // Scatter minor nodes, biased to cluster more densely near hubs.
  const minorPts = [];
  for (let i = 0; i < nodes; i++) {
    const hub = hubPts[Math.floor(rnd() * hubPts.length)];
    const angle = rnd() * Math.PI * 2;
    // exponential-ish falloff so most nodes sit close to a hub, some drift far
    const dist = -Math.log(1 - rnd() * 0.98) * (Math.min(W, H) * 0.16);
    let x = hub[0] + Math.cos(angle) * dist;
    let y = hub[1] + Math.sin(angle) * dist;
    x = Math.max(pad, Math.min(W - pad, x));
    y = Math.max(pad, Math.min(H - pad, y));
    minorPts.push([x, y]);
  }

  const allPts = [...hubPts.map((p) => ({ p, hub: true })), ...minorPts.map((p) => ({ p, hub: false }))];

  let body = "";

  // faint background dust (very light halftone) for print texture — centered
  // so the texture covers the full 16:9 canvas instead of fading toward one
  // corner
  body += halftoneLayer(rnd, {
    focal: [0.5, 0.5],
    maxR: 1.1,
    cols: 70,
    rows: 40,
    opacity: 0.12,
  });

  // filaments: connect each minor node to its nearest hub, plus a handful of
  // cross-links between nearby minor nodes so the field reads as a mesh
  // rather than a strict star topology. Curves are quadratic beziers with a
  // seeded perpendicular offset on the control point for an organic bow.
  function filament(a, b, weight, opacity) {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const bow = (rnd() - 0.5) * len * 0.28;
    const nx = -dy / len;
    const ny = dx / len;
    const cx = mx + nx * bow;
    const cy = my + ny * bow;
    return `<path d="M ${a[0].toFixed(1)} ${a[1].toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}" fill="none" stroke="#0a0a0a" stroke-width="${weight.toFixed(2)}" opacity="${opacity.toFixed(2)}"/>`;
  }

  for (const pt of minorPts) {
    let nearestHub = hubPts[0];
    let nearestD = Infinity;
    for (const h of hubPts) {
      const d = Math.hypot(pt[0] - h[0], pt[1] - h[1]);
      if (d < nearestD) {
        nearestD = d;
        nearestHub = h;
      }
    }
    const t = Math.max(0, 1 - nearestD / (Math.min(W, H) * 0.55));
    body += filament(pt, nearestHub, 0.35 + t * 0.55, 0.18 + t * 0.4);
  }

  // sparse cross-links between nearby minor nodes for mesh density
  for (let i = 0; i < minorPts.length; i++) {
    if (rnd() > 0.16) continue;
    const a = minorPts[i];
    let closest = null;
    let closestD = Infinity;
    for (let j = 0; j < minorPts.length; j++) {
      if (i === j) continue;
      const b = minorPts[j];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (d < closestD && d > 4) {
        closestD = d;
        closest = b;
      }
    }
    if (closest && closestD < Math.min(W, H) * 0.22) {
      body += filament(a, closest, 0.28, 0.14);
    }
  }

  // hub-to-hub connective threads, slightly heavier
  for (let i = 0; i < hubPts.length; i++) {
    for (let j = i + 1; j < hubPts.length; j++) {
      body += filament(hubPts[i], hubPts[j], 0.9, 0.3);
    }
  }

  // nodes: continuous size variation, hubs largest
  for (const { p, hub } of allPts) {
    const r = hub ? 4.4 + rnd() * 1.1 : 0.9 + rnd() * rnd() * 3.2;
    const opacity = hub ? 1 : 0.55 + rnd() * 0.4;
    body += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r.toFixed(2)}" fill="#0a0a0a" opacity="${opacity.toFixed(2)}"/>`;
    if (hub) {
      body += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r + 4.5).toFixed(2)}" fill="none" stroke="#0a0a0a" stroke-width="0.6" opacity="0.35"/>`;
    }
  }

  // micro-labels on the hub nodes
  for (let i = 0; i < labels.length && i < hubPts.length; i++) {
    const [hx, hy] = hubPts[i];
    const above = hy > H * 0.5;
    const ly = above ? hy - 14 : hy + 20;
    const anchor = hx < W * 0.18 ? "start" : hx > W * 0.82 ? "end" : "middle";
    body += `<text x="${hx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-family="ui-monospace, monospace" font-size="9" letter-spacing="1.5" fill="#0a0a0a" opacity="0.75">${labels[i]}</text>`;
  }

  return svgWrap(body, { bg: "#ffffff" });
}

// --- assignments: one distinct piece per experiment ---
const pieces = [
  {
    file: "exp-01-agent-field-services.svg",
    gen: () => viewfinderDiagram(seedFromString("agent-field-services"), { label: "AF · 01" }),
  },
  {
    file: "exp-02-content-derivatives.svg",
    gen: () => filmStrip(seedFromString("content-derivatives"), { frames: 6 }),
  },
  {
    file: "exp-03-deal-intelligence.svg",
    gen: () =>
      halftoneField(seedFromString("deal-intelligence"), {
        focal: [0.62, 0.28],
        maxR: 6.8,
      }),
  },
  {
    file: "exp-04-outreach-systems.svg",
    gen: () => wireframeLandscape(seedFromString("outreach-systems"), { lines: 10, horizonY: 0.58 }),
  },
  {
    file: "exp-05-newsletter-intelligence.svg",
    gen: () => scanlineHorizon(seedFromString("newsletter-intelligence"), { horizonY: 0.46 }),
  },
  {
    file: "exp-06-website-generation.svg",
    gen: () => topographyBlueprint(seedFromString("website-generation"), { rings: 8 }),
  },
];

// --- additional standalone pieces: hero horizon strip + footer horizon strip ---
const heroStrip = halftoneField(seedFromString("hero-horizon"), { focal: [0.5, 0.05], maxR: 5.4 });
const footerStrip = wireframeLandscape(seedFromString("footer-horizon"), { lines: 6, horizonY: 0.72 });
const philosophyDiagram = viewfinderDiagram(seedFromString("philosophy-frame"), { label: "F / 16×9" });
const mycelNetwork = myceliumNetwork(seedFromString("mycel-network"), {
  hubs: 3,
  nodes: 140,
  labels: ["MEMORY", "AGENTS", "DATA"],
});

for (const p of pieces) {
  writeFileSync(join(OUT_DIR, p.file), p.gen(), "utf8");
  console.log("wrote", p.file);
}
writeFileSync(join(OUT_DIR, "hero-horizon.svg"), heroStrip, "utf8");
writeFileSync(join(OUT_DIR, "footer-horizon.svg"), footerStrip, "utf8");
writeFileSync(join(OUT_DIR, "philosophy-diagram.svg"), philosophyDiagram, "utf8");
writeFileSync(join(OUT_DIR, "mycel-network.svg"), mycelNetwork, "utf8");
console.log("wrote hero-horizon.svg, footer-horizon.svg, philosophy-diagram.svg, mycel-network.svg");
console.log("done ->", OUT_DIR);
