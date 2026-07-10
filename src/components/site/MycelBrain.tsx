import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
} from "d3-force";
import { quadtree, type Quadtree } from "d3-quadtree";

// Canvas-rendered, d3-force-simulated Obsidian-style graph of the Mycel
// network (memory / agents / data). Node geometry is produced by a real
// force simulation (charge + link + collide + weak per-node home anchors),
// settled synchronously on mount, then kept perpetually alive at a very low
// alphaTarget for an organic idle "breathing" drift. Everything that touches
// window/canvas/d3 runs inside client-only effects -- the server renders the
// bordered panel chrome, caption bar, and accessible hub buttons only, with
// an empty <canvas> (no draw calls happen server-side, so there is nothing
// to hydrate-mismatch on the pixel content itself).

// --- deterministic PRNG (mulberry32) ---
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

// --- cubic-bezier easing evaluator (Newton-Raphson), matches CSS semantics ---
function makeBezierEasing(mX1: number, mY1: number, mX2: number, mY2: number) {
  const A = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
  const B = (a1: number, a2: number) => 3 * a2 - 6 * a1;
  const C = (a1: number) => 3 * a1;
  const calcBezier = (t: number, a1: number, a2: number) =>
    ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const getSlope = (t: number, a1: number, a2: number) =>
    3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
  const getTForX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const slope = getSlope(t, mX1, mX2);
      if (slope === 0) return t;
      t -= (calcBezier(t, mX1, mX2) - x) / slope;
    }
    return t;
  };
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return calcBezier(getTForX(x), mY1, mY2);
  };
}

// Spec curve for the cluster zoom: cubic-bezier(0, 1, 0.25, 1)
const zoomEase = makeBezierEasing(0, 1, 0.25, 1);
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const HUB_META = [
  {
    label: "MEMORY",
    caption: "Episodic memory. What every experiment learned, kept.",
  },
  {
    label: "AGENTS",
    caption: "The operators. Agents that run the work end to end.",
  },
  {
    label: "DATA",
    caption: "Business data. The ground truth agents act on.",
  },
] as const;

const HUB_COUNT = 3;

// --- graph data model ---

interface GNode {
  id: number;
  cluster: number; // 0/1/2 = hub subtree, negative = an isolated orphan satellite group
  hub: boolean;
  connector: boolean;
  r: number;
  label: string;
  homeX: number;
  homeY: number;
  baseOpacity: number;
  op: number; // current rendered opacity, smoothed frame to frame
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GLink {
  source: number | GNode;
  target: number | GNode;
  cross: boolean; // connects two different hub clusters
  weight: number;
  baseOpacity: number;
  op: number;
}

interface Point {
  x: number;
  y: number;
}

interface World {
  W: number;
  H: number;
}

interface ClusterBBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface Graph {
  nodes: GNode[];
  links: GLink[];
  adjacency: Map<number, Set<number>>;
  hubNodeIds: number[];
  crossLinkCount: number;
  totalLinkCount: number;
  totalNodeCount: number;
}

function shuffle<T>(arr: T[], rnd: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Deterministic graph generator: 3 hubs (MEMORY / AGENTS / DATA), each with a
// 70-90 node subtree grown as chains 2-4 hops deep (not a starburst), 8-12%
// cross-cluster links, a light intra-cluster mesh for texture, and a handful
// of fully-disconnected orphan satellite pairs/triplets. Node "home" anchors
// are a shuffled jittered scatter across the whole world rect, independent
// of cluster -- this is what lets forceX/forceY spread the cloud edge to
// edge instead of collapsing into three separate bursts.
function generateGraph(seedStr: string, world: World): Graph {
  const rnd = mulberry32(seedFromString(seedStr));
  const nodes: GNode[] = [];
  const links: GLink[] = [];
  let nextId = 0;

  for (let h = 0; h < HUB_COUNT; h++) {
    nodes.push({
      id: nextId++,
      cluster: h,
      hub: true,
      connector: true,
      r: 10 + rnd() * 2,
      label: HUB_META[h].label,
      homeX: 0,
      homeY: 0,
      baseOpacity: 1,
      op: 1,
    });
  }

  const clusterOrder: number[][] = [[0], [1], [2]];
  const depthById = new Map<number, number>([
    [0, 0],
    [1, 0],
    [2, 0],
  ]);

  for (let h = 0; h < HUB_COUNT; h++) {
    const count = 70 + Math.floor(rnd() * 21); // 70-90 descendants per hub
    for (let i = 0; i < count; i++) {
      const attachDirect = rnd() < 0.2;
      let parentId: number;
      if (attachDirect) {
        parentId = h;
      } else if (rnd() < 0.55) {
        // chain bias: attach near the growing edge of the subtree. On the
        // first descendant the subtree is just the hub itself, so slice(1)
        // is empty -- fall back to the hub or indexing yields undefined and
        // the link's source crashes the adjacency build client-side.
        const recent = clusterOrder[h].slice(Math.max(1, clusterOrder[h].length - 12));
        parentId = recent.length > 0 ? recent[Math.floor(rnd() * recent.length)] : h;
      } else {
        const pool = clusterOrder[h].filter((id) => (depthById.get(id) ?? 0) < 3);
        parentId = pool.length > 0 ? pool[Math.floor(rnd() * pool.length)] : h;
      }
      const depth = Math.min((depthById.get(parentId) ?? 0) + 1, 4);
      const connector = rnd() < 0.12;
      const id = nextId++;
      const tag = HUB_META[h].label.slice(0, 3);
      nodes.push({
        id,
        cluster: h,
        hub: false,
        connector,
        r: connector ? 3 + rnd() * 2 : 1.5 + rnd() * rnd() * 2.2,
        label: connector
          ? `${tag}-C${String(i).padStart(2, "0")}`
          : `${tag}-${String(i).padStart(3, "0")}`,
        homeX: 0,
        homeY: 0,
        baseOpacity: connector ? 0.85 : 0.55 + rnd() * 0.35,
        op: 0,
      });
      depthById.set(id, depth);
      clusterOrder[h].push(id);
      links.push({
        source: parentId,
        target: id,
        cross: false,
        weight: connector ? 0.7 : 0.45,
        baseOpacity: connector ? 0.18 : 0.14,
        op: 0,
      });
    }
  }

  // Hub-to-hub connective threads -- always cross-cluster.
  for (let i = 0; i < HUB_COUNT; i++) {
    for (let j = i + 1; j < HUB_COUNT; j++) {
      links.push({ source: i, target: j, cross: true, weight: 0.9, baseOpacity: 0.2, op: 0 });
    }
  }

  const existingKeys = new Set(links.map((l) => `${l.source}-${l.target}`));
  const minorNodes = nodes.filter((n) => !n.hub);

  // Cross-cluster links: target ~10% of total links (8-12% band).
  const treeLinkCount = links.length;
  const desiredCross = Math.round((treeLinkCount * 0.1) / (1 - 0.1));
  let added = 0;
  let guard = 0;
  while (added < desiredCross && guard < desiredCross * 25) {
    guard++;
    const a = minorNodes[Math.floor(rnd() * minorNodes.length)];
    const b = minorNodes[Math.floor(rnd() * minorNodes.length)];
    if (a.id === b.id || a.cluster === b.cluster) continue;
    const key = `${a.id}-${b.id}`;
    const key2 = `${b.id}-${a.id}`;
    if (existingKeys.has(key) || existingKeys.has(key2)) continue;
    existingKeys.add(key);
    links.push({ source: a.id, target: b.id, cross: true, weight: 0.4, baseOpacity: 0.13, op: 0 });
    added++;
  }

  // Sparse intra-cluster mesh for interlink texture.
  for (const n of minorNodes) {
    if (rnd() > 0.09) continue;
    const peers = clusterOrder[n.cluster].filter((id) => id !== n.id);
    if (peers.length === 0) continue;
    const peerId = peers[Math.floor(rnd() * peers.length)];
    const key = `${n.id}-${peerId}`;
    const key2 = `${peerId}-${n.id}`;
    if (existingKeys.has(key) || existingKeys.has(key2)) continue;
    existingKeys.add(key);
    links.push({
      source: n.id,
      target: peerId,
      cross: false,
      weight: 0.32,
      baseOpacity: 0.1,
      op: 0,
    });
  }

  // Orphan satellite clusters: small, fully disconnected pairs/triplets.
  const orphanGroups = 6;
  for (let g = 0; g < orphanGroups; g++) {
    const size = rnd() < 0.5 ? 2 : 3;
    const groupCluster = -(g + 1);
    const groupIds: number[] = [];
    for (let i = 0; i < size; i++) {
      const id = nextId++;
      groupIds.push(id);
      nodes.push({
        id,
        cluster: groupCluster,
        hub: false,
        connector: false,
        r: 1.4 + rnd() * 1.3,
        label: `SAT-${g}${i}`,
        homeX: 0,
        homeY: 0,
        baseOpacity: 0.4 + rnd() * 0.35,
        op: 0,
      });
    }
    for (let i = 1; i < groupIds.length; i++) {
      links.push({
        source: groupIds[0],
        target: groupIds[i],
        cross: false,
        weight: 0.3,
        baseOpacity: 0.12,
        op: 0,
      });
    }
  }

  // Top up node count into the 300-340 band with extra leaves grafted onto
  // random existing subtree nodes (keeps degree distribution leaf-heavy).
  const TARGET_TOTAL = 314;
  while (nodes.length < TARGET_TOTAL) {
    const h = Math.floor(rnd() * HUB_COUNT);
    const pool = clusterOrder[h];
    const parentId = pool[Math.floor(rnd() * pool.length)];
    const id = nextId++;
    const tag = HUB_META[h].label.slice(0, 3);
    nodes.push({
      id,
      cluster: h,
      hub: false,
      connector: false,
      r: 1.5 + rnd() * rnd() * 2,
      label: `${tag}-X${String(id).padStart(3, "0")}`,
      homeX: 0,
      homeY: 0,
      baseOpacity: 0.5 + rnd() * 0.35,
      op: 0,
    });
    clusterOrder[h].push(id);
    links.push({
      source: parentId,
      target: id,
      cross: false,
      weight: 0.4,
      baseOpacity: 0.13,
      op: 0,
    });
  }

  // --- home anchors: a shuffled, jittered scatter across the WHOLE world
  // rect, independent of cluster membership. This is what keeps the settled
  // cloud from collapsing to the center or reading as three separate
  // bursts -- every node, regardless of hub, is weakly pulled toward a
  // point spread evenly across the full frame.
  const pad = Math.min(world.W, world.H) * 0.04;
  const usableW = world.W - pad * 2;
  const usableH = world.H - pad * 2;
  const cols = Math.max(1, Math.round(Math.sqrt((nodes.length * usableW) / usableH)));
  const rows = Math.max(1, Math.ceil(nodes.length / cols));
  const cellW = usableW / cols;
  const cellH = usableH / rows;
  const cells: Point[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: pad + c * cellW + cellW / 2 + (rnd() - 0.5) * cellW * 0.8,
        y: pad + r * cellH + cellH / 2 + (rnd() - 0.5) * cellH * 0.8,
      });
    }
  }
  shuffle(cells, rnd);

  const cx = world.W / 2;
  const cy = world.H / 2;
  const maxRadius = Math.hypot(world.W, world.H) / 2;

  nodes.forEach((n, i) => {
    if (n.cluster < 0) {
      // Orphan satellites bias toward the periphery so they read as
      // detached outliers rather than folding into the main cloud.
      const angle = rnd() * Math.PI * 2;
      const radius = maxRadius * (0.72 + rnd() * 0.24);
      const x = Math.max(pad, Math.min(world.W - pad, cx + Math.cos(angle) * radius));
      const y = Math.max(pad, Math.min(world.H - pad, cy + Math.sin(angle) * radius));
      n.homeX = x;
      n.homeY = y;
    } else {
      const cell = cells[i % cells.length];
      n.homeX = cell.x;
      n.homeY = cell.y;
    }
    n.x = n.homeX;
    n.y = n.homeY;
  });

  const adjacency = new Map<number, Set<number>>();
  for (const n of nodes) adjacency.set(n.id, new Set());
  for (const l of links) {
    const a = typeof l.source === "number" ? l.source : l.source.id;
    const b = typeof l.target === "number" ? l.target : l.target.id;
    adjacency.get(a)?.add(b);
    adjacency.get(b)?.add(a);
  }

  return {
    nodes,
    links,
    adjacency,
    hubNodeIds: [0, 1, 2],
    crossLinkCount: links.filter((l) => l.cross).length,
    totalLinkCount: links.length,
    totalNodeCount: nodes.length,
  };
}

// Builds and synchronously settles a real d3-force simulation, then rescales
// the settled bounding box (nodes + their home anchors, so idle breathing
// stays consistent) onto the world rect minus 4% padding on every side --
// this is the step that guarantees the cloud touches all four edges
// regardless of how the physics happened to spread out.
function buildSimulation(graph: Graph, world: World): Simulation<GNode, GLink> {
  const sim = forceSimulation(graph.nodes)
    .force(
      "charge",
      forceManyBody<GNode>().strength((d) => (d.hub ? -180 : d.connector ? -36 : -11)),
    )
    .force(
      "link",
      forceLink<GNode, GLink>(graph.links)
        .id((d) => d.id)
        .distance((l) => {
          const s = l.source as GNode;
          const t = l.target as GNode;
          if (s.hub || t.hub) return 46;
          return l.cross ? 60 : 15;
        })
        .strength((l) => (l.cross ? 0.22 : 0.55)),
    )
    .force(
      "collide",
      forceCollide<GNode>()
        .radius((d) => d.r + 1.3)
        .strength(0.85),
    )
    .force("x", forceX<GNode>((d) => d.homeX).strength(0.05))
    .force("y", forceY<GNode>((d) => d.homeY).strength(0.05))
    .alphaDecay(0.022)
    .stop();

  for (let i = 0; i < 260; i++) sim.tick();

  const pad = Math.min(world.W, world.H) * 0.04;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of graph.nodes) {
    minX = Math.min(minX, (n.x ?? 0) - n.r);
    maxX = Math.max(maxX, (n.x ?? 0) + n.r);
    minY = Math.min(minY, (n.y ?? 0) - n.r);
    maxY = Math.max(maxY, (n.y ?? 0) + n.r);
  }
  const targetW = world.W - pad * 2;
  const targetH = world.H - pad * 2;
  const bboxW = Math.max(1, maxX - minX);
  const bboxH = Math.max(1, maxY - minY);
  const scale = Math.min(targetW / bboxW, targetH / bboxH);
  const offsetX = pad + (targetW - bboxW * scale) / 2 - minX * scale;
  const offsetY = pad + (targetH - bboxH * scale) / 2 - minY * scale;

  for (const n of graph.nodes) {
    n.x = (n.x ?? 0) * scale + offsetX;
    n.y = (n.y ?? 0) * scale + offsetY;
    n.homeX = n.homeX * scale + offsetX;
    n.homeY = n.homeY * scale + offsetY;
    n.r = n.r * scale;
  }

  // Idle breathing: perpetual, very low alphaTarget so the whole cloud
  // drifts subtly and continuously via d3's own timer.
  sim.alphaTarget(0.006).restart();
  return sim;
}

function computeClusterBBoxes(nodes: GNode[], world: World): Map<number, ClusterBBox> {
  const boxes = new Map<number, ClusterBBox>();
  for (let c = 0; c < HUB_COUNT; c++) {
    const members = nodes.filter((n) => n.cluster === c);
    if (members.length === 0) continue;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of members) {
      minX = Math.min(minX, (n.x ?? 0) - n.r);
      maxX = Math.max(maxX, (n.x ?? 0) + n.r);
      minY = Math.min(minY, (n.y ?? 0) - n.r);
      maxY = Math.max(maxY, (n.y ?? 0) + n.r);
    }
    const marginX = (maxX - minX) * 0.3 + 26;
    const marginY = (maxY - minY) * 0.3 + 30;
    boxes.set(c, {
      minX: Math.max(0, minX - marginX),
      minY: Math.max(0, minY - marginY),
      maxX: Math.min(world.W, maxX + marginX),
      maxY: Math.min(world.H, maxY + marginY),
    });
  }
  return boxes;
}

type ViewBox = { x: number; y: number; w: number; h: number };

// The DOM container's real aspect ratio does not necessarily match the
// world's (the panel's box is sized by the surrounding grid/layout, not by
// `world.W`/`world.H`). Deriving the canvas transform from container width
// alone silently assumes those ratios match; when they don't, the (correctly
// vertically-centered) world content gets stretched past the bottom of the
// canvas and clipped there, while the top margin stays fully visible -- read
// as "empty band at the top, cloud bunched at the bottom". A "contain"-style
// fit (matching SVG's `preserveAspectRatio="xMidYMid meet"`) scales by
// whichever axis is more constraining and letterboxes the other symmetrically,
// so the view is always centered in both axes regardless of container shape.
// FILL grows the cloud past a bare "contain" fit so it reads as filling the
// panel rather than floating in generous letterboxing. It's an aspiration,
// not a guarantee: MIN_MARGIN below is the actual safety floor. The world
// bounding box baked into `view` (see buildSimulation) already carries its
// own inboard padding around the real node/label extents, so shrinking the
// letterbox down to MIN_MARGIN pixels -- rather than to zero -- still leaves
// that inboard padding intact and nothing (node or hub label) reaches the
// true panel edge.
const FILL = 1.25;
const MIN_MARGIN = 22;

function getFitTransform(cssW: number, cssH: number, view: ViewBox) {
  const containScale = Math.min(cssW / view.w, cssH / view.h);
  const maxScaleX = Math.max(0, (cssW - MIN_MARGIN * 2) / view.w);
  const maxScaleY = Math.max(0, (cssH - MIN_MARGIN * 2) / view.h);
  // Never scale below the plain contain-fit (that baseline is already
  // provably non-clipping) even if the panel is too small for MIN_MARGIN to
  // be satisfiable -- in that degenerate case we just fall back to contain.
  const scale = Math.max(containScale, Math.min(containScale * FILL, maxScaleX, maxScaleY));
  const padX = (cssW - view.w * scale) / 2;
  const padY = (cssH - view.h * scale) / 2;
  return { scale, padX, padY };
}

// Generic starting placeholder positions for the accessible hub buttons,
// identical on server and client (no seed/simulation involved) so there is
// no hydration mismatch; the client swaps these to exact settled coordinates
// once the simulation has run, via a post-mount state update.
const PLACEHOLDER_HUB_POS: Record<"portrait" | "landscape", Point[]> = {
  portrait: [
    { x: 27, y: 15 },
    { x: 70, y: 50 },
    { x: 27, y: 84 },
  ],
  landscape: [
    { x: 16, y: 26 },
    { x: 74, y: 49 },
    { x: 21, y: 77 },
  ],
};

interface GraphCanvasProps {
  world: World;
  orientation: "portrait" | "landscape";
  seed: string;
}

function GraphCanvas({ world, orientation, seed }: GraphCanvasProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  const graphRef = useRef<Graph | null>(null);
  const simRef = useRef<Simulation<GNode, GLink> | null>(null);
  const quadtreeRef = useRef<Quadtree<GNode> | null>(null);
  const clusterBBoxRef = useRef<Map<number, ClusterBBox>>(new Map());
  const hoveredIdRef = useRef<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const viewRef = useRef<ViewBox>({ x: 0, y: 0, w: world.W, h: world.H });
  const viewAnimRef = useRef<{
    from: ViewBox;
    to: ViewBox;
    start: number;
    duration: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const dprRef = useRef(1);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [hubScreenPos, setHubScreenPos] = useState<Point[]>(PLACEHOLDER_HUB_POS[orientation]);

  const onInteract = useCallback(() => setHasInteracted(true), []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const graph = graphRef.current;
    if (!canvas || !graph) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0 || cssH === 0) return;
    const dpr = dprRef.current;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }

    const view = viewRef.current;
    const { scale, padX, padY } = getFitTransform(cssW, cssH, view);

    // Clear in device pixels (identity transform) so the whole canvas is
    // wiped even where the fit transform below letterboxes the content.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(
      dpr * scale,
      0,
      0,
      dpr * scale,
      dpr * (padX - view.x * scale),
      dpr * (padY - view.y * scale),
    );

    const ink = "rgb(20, 20, 20)";

    ctx.lineCap = "round";
    for (const l of graph.links) {
      if (l.op <= 0.004) continue;
      const s = l.source as GNode;
      const t = l.target as GNode;
      ctx.strokeStyle = ink;
      ctx.globalAlpha = l.op;
      ctx.lineWidth = Math.max(0.35, l.weight * scale * 0.6) / scale;
      ctx.beginPath();
      ctx.moveTo(s.x ?? 0, s.y ?? 0);
      ctx.lineTo(t.x ?? 0, t.y ?? 0);
      ctx.stroke();
    }

    for (const n of graph.nodes) {
      if (n.op <= 0.004) continue;
      ctx.globalAlpha = n.op;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(n.x ?? 0, n.y ?? 0, n.r, 0, Math.PI * 2);
      ctx.fill();
      if (n.hub) {
        ctx.globalAlpha = n.op * 0.4;
        ctx.lineWidth = 0.6 / scale;
        ctx.strokeStyle = ink;
        ctx.beginPath();
        ctx.arc(n.x ?? 0, n.y ?? 0, n.r * 1.9, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    ctx.font = `${13 / scale}px "Geist Mono Variable", ui-monospace, monospace`;
    ctx.fillStyle = ink;
    ctx.textBaseline = "alphabetic";
    for (const id of graph.hubNodeIds) {
      const n = graph.nodes[id];
      if (!n || n.op <= 0.02) continue;
      const above = (n.y ?? 0) > world.H * 0.5;
      const anchor =
        (n.x ?? 0) < world.W * 0.3 ? "start" : (n.x ?? 0) > world.W * 0.7 ? "end" : "middle";
      ctx.textAlign = anchor;
      ctx.globalAlpha = n.op;
      ctx.fillText(
        n.label,
        n.x ?? 0,
        above ? (n.y ?? 0) - n.r * 1.9 - 6 / scale : (n.y ?? 0) + n.r * 1.9 + 16 / scale,
      );
    }
    ctx.globalAlpha = 1;
  }, [world.H, world.W]);

  const targetOpacities = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const sel = selectedRef.current;
    const hovered = hoveredIdRef.current;
    const neighbors = hovered !== null ? graph.adjacency.get(hovered) : null;

    for (const n of graph.nodes) {
      const clusterFactor = sel === null ? 1 : n.cluster === sel ? 1 : 0.06;
      const hoverFactor = neighbors ? (n.id === hovered || neighbors.has(n.id) ? 1 : 0.32) : 1;
      const target = n.baseOpacity * clusterFactor * hoverFactor;
      n.op += (target - n.op) * 0.22;
    }
    for (const l of graph.links) {
      const s = l.source as GNode;
      const t = l.target as GNode;
      const clusterFactor = sel === null ? 1 : s.cluster === sel && t.cluster === sel ? 1 : 0.05;
      const hoverFactor = neighbors
        ? (s.id === hovered || neighbors.has(s.id)) && (t.id === hovered || neighbors.has(t.id))
          ? 1
          : 0.28
        : 1;
      const target = l.baseOpacity * clusterFactor * hoverFactor;
      l.op += (target - l.op) * 0.22;
    }
  }, []);

  const stepViewAnim = useCallback(() => {
    const anim = viewAnimRef.current;
    if (!anim) return;
    const now = performance.now();
    const elapsed = now - anim.start;
    const t = anim.duration === 0 ? 1 : Math.min(1, elapsed / anim.duration);
    const eased = zoomEase(t);
    viewRef.current = {
      x: anim.from.x + (anim.to.x - anim.from.x) * eased,
      y: anim.from.y + (anim.to.y - anim.from.y) * eased,
      w: anim.from.w + (anim.to.w - anim.from.w) * eased,
      h: anim.from.h + (anim.to.h - anim.from.h) * eased,
    };
    if (t >= 1) viewAnimRef.current = null;
  }, []);

  const frame = useCallback(() => {
    stepViewAnim();
    targetOpacities();
    draw();
    rafRef.current = requestAnimationFrame(frame);
  }, [draw, stepViewAnim, targetOpacities]);

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const animateViewTo = useCallback(
    (target: ViewBox) => {
      viewAnimRef.current = {
        from: { ...viewRef.current },
        to: target,
        start: performance.now(),
        duration: prefersReducedMotion ? 0 : 380,
      };
      if (prefersReducedMotion) {
        viewRef.current = target;
        viewAnimRef.current = null;
        draw();
      }
    },
    [draw, prefersReducedMotion],
  );

  const selectHub = useCallback(
    (cluster: number) => {
      onInteract();
      setSelected((prev) => {
        const next = prev === cluster ? null : cluster;
        selectedRef.current = next;
        const box = next === null ? null : clusterBBoxRef.current.get(next);
        animateViewTo(
          box
            ? { x: box.minX, y: box.minY, w: box.maxX - box.minX, h: box.maxY - box.minY }
            : { x: 0, y: 0, w: world.W, h: world.H },
        );
        return next;
      });
    },
    [animateViewTo, onInteract, world.H, world.W],
  );

  const deselect = useCallback(() => {
    if (selectedRef.current === null) return;
    selectedRef.current = null;
    setSelected(null);
    animateViewTo({ x: 0, y: 0, w: world.W, h: world.H });
  }, [animateViewTo, world.H, world.W]);

  // Escape zooms back out.
  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") deselect();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, deselect]);

  // Main client-only setup: build graph, run the force simulation, wire the
  // canvas + pointer + resize + visibility handling. Runs once per mount
  // (mount is keyed by orientation upstream, so this re-runs only on a
  // portrait/landscape flip, not on every resize).
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    dprRef.current = Math.min(2, window.devicePixelRatio || 1);

    const graph = generateGraph(seed, world);
    graphRef.current = graph;
    viewRef.current = { x: 0, y: 0, w: world.W, h: world.H };

    const sim = buildSimulation(graph, world);
    if (prefersReducedMotion) sim.stop();
    simRef.current = sim;

    clusterBBoxRef.current = computeClusterBBoxes(graph.nodes, world);

    const hubPos = graph.hubNodeIds.map((id) => {
      const n = graph.nodes[id];
      return { x: ((n.x ?? 0) / world.W) * 100, y: ((n.y ?? 0) / world.H) * 100 };
    });
    setHubScreenPos(hubPos);
    setReady(true);

    // Warm the smoothed opacities to their resting values immediately so
    // the first frame isn't a fade-in from zero.
    for (const n of graph.nodes) n.op = n.baseOpacity;
    for (const l of graph.links) l.op = l.baseOpacity;

    draw();

    const qt = () =>
      quadtree<GNode>()
        .x((d) => d.x ?? 0)
        .y((d) => d.y ?? 0)
        .addAll(graph.nodes);
    quadtreeRef.current = qt();

    let quadtreeRebuildCounter = 0;
    const rebuildQuadtreeTick = () => {
      quadtreeRebuildCounter++;
      if (quadtreeRebuildCounter % 4 === 0) quadtreeRef.current = qt();
    };
    sim.on("tick.quadtree", rebuildQuadtreeTick);

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && document.visibilityState === "visible") {
          if (!prefersReducedMotion) sim.restart();
          startLoop();
        } else {
          sim.stop();
          stopLoop();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(container);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        sim.stop();
        stopLoop();
      } else if (isVisibleRef.current) {
        if (!prefersReducedMotion) sim.restart();
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => draw());
    ro.observe(container);

    if (!prefersReducedMotion) startLoop();

    const toWorld = (clientX: number, clientY: number): Point => {
      const rect = canvas.getBoundingClientRect();
      const view = viewRef.current;
      const { scale, padX, padY } = getFitTransform(rect.width, rect.height, view);
      return {
        x: view.x + (clientX - rect.left - padX) / scale,
        y: view.y + (clientY - rect.top - padY) / scale,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const { x, y } = toWorld(event.clientX, event.clientY);
      const found = quadtreeRef.current?.find(x, y, 14);
      hoveredIdRef.current = found ? found.id : null;
      const label = labelRef.current;
      if (label) {
        if (found) {
          const rect = canvas.getBoundingClientRect();
          label.textContent = found.hub ? found.label : found.label;
          label.style.opacity = found.hub ? "0" : "1";
          label.style.transform = `translate(${event.clientX - rect.left + 10}px, ${
            event.clientY - rect.top - 10
          }px)`;
        } else {
          label.style.opacity = "0";
        }
      }
      if (prefersReducedMotion) draw();
    };
    const onPointerLeave = () => {
      hoveredIdRef.current = null;
      if (labelRef.current) labelRef.current.style.opacity = "0";
      if (prefersReducedMotion) draw();
    };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const onClick = (event: MouseEvent) => {
      const { x, y } = toWorld(event.clientX, event.clientY);
      const found = quadtreeRef.current?.find(x, y, 14);
      onInteract();
      if (found?.hub) {
        selectHub(found.cluster);
      } else if (selectedRef.current !== null) {
        deselect();
      }
    };
    canvas.addEventListener("click", onClick);

    return () => {
      sim.stop();
      stopLoop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, world.W, world.H]);

  const activeCaption = selected === null ? null : HUB_META[selected].caption;

  return (
    <div ref={containerRef} className="relative h-full w-full bg-background text-ink">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-pointer"
        role="img"
        aria-label="Mycel network: memory, agents, and data, connected through a shared substrate"
      />

      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em] text-ink opacity-0"
        style={{ transition: "opacity 120ms linear" }}
      />

      {/* Visually-hidden but focusable buttons at each hub's live position:
          keyboard + screen-reader access, independent of canvas hit-testing. */}
      {HUB_META.map((meta, i) => {
        const pos = hubScreenPos[i] ?? PLACEHOLDER_HUB_POS[orientation][i];
        return (
          <button
            key={meta.label}
            type="button"
            aria-pressed={selected === i}
            aria-label={`${meta.label} system${selected === i ? ", selected" : ""}`}
            onClick={() => selectHub(i)}
            className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink/60"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          />
        );
      })}

      {!hasInteracted && selected === null && (
        <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.14em] text-graphite">
          Select a system
        </div>
      )}

      {selected !== null && (
        <button
          type="button"
          onClick={deselect}
          className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-[0.14em] text-graphite transition-colors duration-150 hover:text-ink"
        >
          ← All systems
        </button>
      )}

      <div
        aria-live="polite"
        className="absolute inset-x-0 bottom-0 min-h-[4.6em] border-t border-ink/20 bg-background/92 px-4 py-3 backdrop-blur-[2px] md:px-5 md:py-4"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={selected ?? "all"}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-ink"
          >
            {activeCaption ?? "Three systems, one substrate. Select a node to isolate it."}
          </motion.p>
        </AnimatePresence>
      </div>

      {!ready && <div className="pointer-events-none absolute inset-0" aria-hidden="true" />}
    </div>
  );
}

const WORLD_PORTRAIT: World = { W: 900, H: 1600 };
const WORLD_LANDSCAPE: World = { W: 1600, H: 900 };

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export function MycelBrain() {
  const isDesktop = useIsDesktop();
  const orientation = isDesktop ? "portrait" : "landscape";
  const world = isDesktop ? WORLD_PORTRAIT : WORLD_LANDSCAPE;

  // Keying on orientation remounts GraphCanvas (and its simulation) only
  // when portrait/landscape actually flips -- not on every resize.
  const key = useMemo(() => orientation, [orientation]);

  return (
    <GraphCanvas
      key={key}
      world={world}
      orientation={orientation}
      seed={`mycel-brain-v3-${orientation}`}
    />
  );
}
