import type { DatasetNode } from "./dataset";

// A tree-shaped Sankey layout (Brasil -> groups -> subgroups). Hand-rolled
// rather than d3-sankey so that:
//   - node order never changes between frames (bands don't jump around),
//   - the vertical scale can be absolute (chart grows with the population),
//   - units that don't exist yet (value 0) collapse smoothly, gaps included.

export type LaidOutNode = DatasetNode & {
  value: number;
  x: number;
  y: number;
  height: number;
};

export type LaidOutLink = {
  source: LaidOutNode;
  target: LaidOutNode;
  // Top edge of the band where it leaves the source / enters the target.
  y0: number;
  y1: number;
  height: number;
};

export type LayoutOptions = {
  values: Record<string, number>;
  top: number;
  bottom: number;
  columnX: number[];
  barWidth: number;
  // Gap between sibling nodes, per level.
  padding: number[];
  // Total population that maps to the full chart height. Use the current total
  // for a relative scale or the all-time max for an absolute one.
  scaleTotal: number;
};

export const layoutSankey = (nodes: DatasetNode[], opts: LayoutOptions) => {
  const { values, top, bottom, columnX, padding } = opts;
  const total = values.brasil;
  const levels = Math.max(...nodes.map((n) => n.level)) + 1;

  // A node only claims its gap once it is a noticeable share of the total, so a
  // state that appears (0 -> something) eases its gap in instead of popping.
  const gapFor = (n: DatasetNode) =>
    padding[n.level] * Math.min(1, (values[n.id] ?? 0) / Math.max(1, total * 0.003));

  const byLevel = Array.from({ length: levels }, (_, l) => nodes.filter((n) => n.level === l));
  const gapsAtFullScale = byLevel.map((col) => col.slice(1).reduce((s, n) => s + padding[n.level], 0));
  const maxGaps = Math.max(...gapsAtFullScale);
  const k = (bottom - top - maxGaps) / opts.scaleTotal;

  const laid = new Map<string, LaidOutNode>();
  byLevel.forEach((col, level) => {
    const heights = col.map((n) => (values[n.id] ?? 0) * k);
    const gaps = col.map((n, i) => (i === 0 ? 0 : gapFor(n)));
    const colHeight = heights.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0);
    // Center every column on the same midline so bands stay roughly horizontal.
    let y = top + (bottom - top - colHeight) / 2;
    col.forEach((n, i) => {
      y += gaps[i];
      laid.set(n.id, { ...n, value: values[n.id] ?? 0, x: columnX[level], y, height: heights[i] });
      y += heights[i];
    });
  });

  const links: LaidOutLink[] = [];
  for (const source of laid.values()) {
    let y0 = source.y;
    for (const target of laid.values()) {
      if (target.parent !== source.id) continue;
      links.push({ source, target, y0, y1: target.y, height: target.height });
      y0 += target.height;
    }
  }

  return { nodes: [...laid.values()], links };
};

// Closed path for a band between two vertical bars, with horizontal tangents.
export const linkPath = (link: LaidOutLink, barWidth: number) => {
  const x0 = link.source.x + barWidth;
  const x1 = link.target.x;
  const xm = (x0 + x1) / 2;
  const { y0, y1, height: h } = link;
  return [
    `M${x0},${y0}`,
    `C${xm},${y0} ${xm},${y1} ${x1},${y1}`,
    `L${x1},${y1 + h}`,
    `C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h}`,
    "Z",
  ].join(" ");
};

// Spreads labels vertically so none overlap, keeping each as close as possible
// to its node's center. `weights` (0..1) shrink the space a fading label takes,
// so labels appearing or disappearing push their neighbours smoothly.
// Returns the label center y for each input, in order.
export const spreadLabels = (centers: number[], weights: number[], gap: number, top: number, bottom: number) => {
  const ys = [...centers];
  const space = (i: number) => (gap * (weights[i] + weights[i + 1])) / 2;
  for (let i = 0; i < ys.length; i++) ys[i] = Math.max(ys[i], i === 0 ? top : ys[i - 1] + space(i - 1));
  for (let i = ys.length - 1; i >= 0; i--) ys[i] = Math.min(ys[i], i === ys.length - 1 ? bottom : ys[i + 1] - space(i));
  return ys;
};
