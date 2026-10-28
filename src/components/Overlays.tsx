import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { formatFull } from "../lib/format";

const SIDE = 80;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

type Ink = { primary: string; secondary: string; accent: string };

export const TitleCard: React.FC<{
  title: string;
  subtitle: string;
  ink: Ink;
  background: string;
  titleFont: string;
  textFont: string;
}> = ({ title, subtitle, ink, background, titleFont, textFont }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 0.5 * fps, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill
      name="Título"
      style={{ justifyContent: "center", padding: `0 ${SIDE}px`, opacity: out, gap: 36, backgroundColor: background }}
    >
      <div
        style={{
          fontFamily: titleFont,
          fontWeight: 900,
          fontSize: 104,
          lineHeight: 1.05,
          color: ink.primary,
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], { ...clamp, easing: easeOut }),
          translate: `0px ${interpolate(frame, [0, 0.8 * fps], [60, 0], { ...clamp, easing: easeOut })}px`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: textFont,
          fontWeight: 600,
          fontSize: 50,
          lineHeight: 1.25,
          color: ink.accent,
          opacity: interpolate(frame, [0.4 * fps, 1.1 * fps], [0, 1], { ...clamp, easing: easeOut }),
          translate: `0px ${interpolate(frame, [0.4 * fps, 1.2 * fps], [40, 0], { ...clamp, easing: easeOut })}px`,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

// Year + running total, pinned above the chart.
export const ChartHeader: React.FC<{
  title: string;
  year: number;
  total: number;
  totalLabel: string;
  ink: Ink;
  titleFont: string;
  textFont: string;
}> = ({ title, year, total, totalLabel, ink, titleFont, textFont }) => {
  return (
    <div style={{ position: "absolute", top: 110, left: SIDE, right: SIDE }}>
      <div style={{ fontFamily: textFont, fontWeight: 700, fontSize: 40, color: ink.secondary, lineHeight: 1.2 }}>
        {title}
      </div>
      <div
        style={{
          fontFamily: titleFont,
          fontWeight: 900,
          fontSize: 170,
          lineHeight: 1,
          color: ink.accent,
          fontVariantNumeric: "tabular-nums",
          marginTop: 10,
        }}
      >
        {year}
      </div>
      <div style={{ fontFamily: textFont, fontSize: 44, color: ink.primary, marginTop: 6 }}>
        <span style={{ color: ink.secondary }}>{totalLabel} </span>
        <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{formatFull(total)}</span>
      </div>
    </div>
  );
};

// A short fact that appears while one census is on screen.
export const Callout: React.FC<{
  text: string;
  // Seconds into the census slot, and that slot's length.
  seconds: number;
  slot: number;
  // The callout's bottom edge sits here, so longer texts grow upwards, away from the chart.
  bottom: number;
  ink: Ink;
  background: string;
  textFont: string;
}> = ({ text, seconds, slot, bottom, ink, background, textFont }) => {
  const { width, height } = useVideoConfig();
  const opacity = interpolate(seconds, [0.1, 0.45, slot - 0.35, slot], [0, 1, 1, 0], clamp);
  if (opacity === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: height - bottom,
        left: SIDE,
        maxWidth: width - SIDE * 2 - 60,
        padding: "16px 26px",
        borderRadius: 18,
        background,
        borderLeft: `8px solid ${ink.accent}`,
        fontFamily: textFont,
        fontWeight: 700,
        fontSize: 40,
        lineHeight: 1.25,
        color: ink.primary,
        opacity,
        translate: `${interpolate(seconds, [0.1, 0.5], [-40, 0], { ...clamp, easing: easeOut })}px 0px`,
      }}
    >
      {text}
    </div>
  );
};

export const SourceFooter: React.FC<{ text: string; top: number; ink: Ink; textFont: string }> = ({
  text,
  top,
  ink,
  textFont,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: SIDE,
      right: SIDE,
      fontFamily: textFont,
      fontSize: 26,
      color: ink.secondary,
    }}
  >
    {text}
  </div>
);

export const EndCard: React.FC<{
  title: string;
  subtitle: string;
  ink: Ink;
  background: string;
  titleFont: string;
  textFont: string;
}> = ({ title, subtitle, ink, background, titleFont, textFont }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      name="Encerramento"
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        padding: `0 ${SIDE}px`,
        backgroundColor: background,
        opacity: interpolate(frame, [0, 0.5 * fps], [0, 0.94], clamp),
      }}
    >
      <div
        style={{
          fontFamily: titleFont,
          fontWeight: 900,
          fontSize: 96,
          color: ink.primary,
          textAlign: "center",
          lineHeight: 1.05,
          scale: interpolate(frame, [0.2 * fps, 0.9 * fps], [0.8, 1], { ...clamp, easing: Easing.spring({ damping: 200 }) }),
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: textFont,
          fontWeight: 700,
          fontSize: 48,
          padding: "22px 48px",
          borderRadius: 999,
          backgroundColor: ink.accent,
          color: background,
          opacity: interpolate(frame, [0.6 * fps, 1.1 * fps], [0, 1], clamp),
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
