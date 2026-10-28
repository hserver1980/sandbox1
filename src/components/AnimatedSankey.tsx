import React from "react";
import { useVideoConfig } from "remotion";
import type { Dataset } from "../lib/dataset";
import { formatCompact, formatPercent } from "../lib/format";
import { layoutSankey, linkPath, spreadLabels, type LaidOutNode } from "../lib/layout";

type Props = {
  dataset: Dataset;
  values: Record<string, number>;
  // Fill color per node id.
  colors: Record<string, string>;
  scaleTotal: number;
  top: number;
  bottom: number;
  labelSize: number;
  linkOpacity: number;
  textPrimary: string;
  textSecondary: string;
  background: string;
  fontFamily: string;
};

const BAR = 22;
const SIDE = 80; // safe margin from the left edge
const LABEL_GAP = 14;

// A share below this is treated as "not there yet": label hidden, fading in above it.
const visibility = (share: number) => Math.min(1, Math.max(0, (share - 0.00002) / 0.0008));

export const AnimatedSankey: React.FC<Props> = (p) => {
  const { width } = useVideoConfig();
  const { dataset, values } = p;
  const levels = Math.max(...dataset.nodes.map((n) => n.level)) + 1;
  const deep = levels > 2;

  // Space reserved to the right of the last column for its labels. Kept clear of
  // the right edge, where the Shorts like/comment buttons sit.
  const leafLabelWidth = deep ? p.labelSize * 6.5 : p.labelSize * 7.5;
  const lastX = width - SIDE - leafLabelWidth;
  const columnX = Array.from({ length: levels }, (_, l) => SIDE + ((lastX - SIDE) * l) / (levels - 1));

  const { nodes, links } = layoutSankey(dataset.nodes, {
    values,
    top: p.top,
    bottom: p.bottom,
    columnX,
    barWidth: BAR,
    padding: deep ? [0, 26, 6] : [0, 40],
    scaleTotal: p.scaleTotal,
  });

  const total = values.brasil;
  const leaves = nodes.filter((n) => n.level === levels - 1);
  const middle = deep ? nodes.filter((n) => n.level === 1) : [];
  const root = nodes.find((n) => n.level === 0) as LaidOutNode;

  const leafLineHeight = deep ? p.labelSize * 1.2 : p.labelSize * 2.9;
  const leafWeights = leaves.map((n) => visibility(n.value / total));
  const leafYs = spreadLabels(
    leaves.map((n) => n.y + n.height / 2),
    leafWeights,
    leafLineHeight,
    p.top + leafLineHeight / 2,
    p.bottom - leafLineHeight / 2,
  );

  return (
    <svg width={width} height={p.bottom + 40} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
      <defs>
        {links.map((l) => (
          <linearGradient
            key={l.target.id}
            id={`grad-${l.target.id}`}
            gradientUnits="userSpaceOnUse"
            x1={l.source.x + BAR}
            x2={l.target.x}
            y1={0}
            y2={0}
          >
            <stop offset="0%" stopColor={p.colors[l.source.id]} />
            <stop offset="100%" stopColor={p.colors[l.target.id]} />
          </linearGradient>
        ))}
      </defs>

      {links.map((l) =>
        l.height > 0.05 ? (
          <path key={l.target.id} d={linkPath(l, BAR)} fill={`url(#grad-${l.target.id})`} opacity={p.linkOpacity} />
        ) : null,
      )}

      {nodes.map((n) =>
        n.height > 0.05 ? (
          <rect key={n.id} x={n.x} y={n.y} width={BAR} height={n.height} rx={Math.min(4, n.height / 2)} fill={p.colors[n.id]} />
        ) : null,
      )}

      {/* Root label runs vertically beside the root bar. */}
      <text
        x={root.x - 18}
        y={root.y + root.height / 2}
        transform={`rotate(-90 ${root.x - 18} ${root.y + root.height / 2})`}
        textAnchor="middle"
        fill={p.textSecondary}
        fontFamily={p.fontFamily}
        fontWeight={700}
        fontSize={p.labelSize * 0.9}
        letterSpacing={4}
      >
        {root.label.toUpperCase()}
      </text>

      {/* Middle column labels sit on a pill so they stay legible over the bands. */}
      {middle.map((n) => {
        const opacity = visibility(n.value / total);
        if (opacity === 0) return null;
        const size = p.labelSize * 1.05;
        const text = `${n.label} ${formatPercent(n.value / total)}`;
        const pillW = text.length * size * 0.58 + 24;
        const x = n.x + BAR + 10;
        const y = n.y + n.height / 2;
        return (
          <g key={n.id} opacity={opacity}>
            <rect x={x} y={y - size * 0.75} width={pillW} height={size * 1.5} rx={size * 0.75} fill={p.background} opacity={0.82} />
            <text x={x + 12} y={y} dominantBaseline="central" fill={p.textPrimary} fontFamily={p.fontFamily} fontWeight={700} fontSize={size}>
              {text}
            </text>
          </g>
        );
      })}

      {leaves.map((n, i) => {
        const opacity = leafWeights[i];
        if (opacity === 0) return null;
        const cy = n.y + n.height / 2;
        const ly = leafYs[i];
        const x = n.x + BAR + LABEL_GAP;
        return (
          <g key={n.id} opacity={opacity}>
            {Math.abs(ly - cy) > 2 ? (
              <path d={`M${n.x + BAR + 2},${cy} L${x - 4},${ly}`} stroke={p.textSecondary} strokeWidth={1.5} opacity={0.5} fill="none" />
            ) : null}
            {deep ? (
              <text x={x} y={ly} dominantBaseline="central" fontFamily={p.fontFamily} fontSize={p.labelSize}>
                <tspan fill={p.textPrimary} fontWeight={800}>
                  {n.short ?? n.label}
                </tspan>
                <tspan fill={p.textSecondary} fontWeight={400} dx={10}>
                  {formatCompact(n.value)}
                </tspan>
              </text>
            ) : (
              <text x={x} y={ly} fontFamily={p.fontFamily}>
                <tspan x={x} dy={-p.labelSize * 0.35} fill={p.textPrimary} fontWeight={800} fontSize={p.labelSize * 1.4}>
                  {n.label}
                </tspan>
                <tspan x={x} dy={p.labelSize * 1.5} fill={p.textSecondary} fontWeight={600} fontSize={p.labelSize}>
                  {formatCompact(n.value)} · {formatPercent(n.value / total)}
                </tspan>
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
