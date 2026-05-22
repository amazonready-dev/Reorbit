import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DISPLAY, colors, useEnter } from "../MainVideo";

const stats = [
  { label: "Emails sent", value: 12480, prefix: "", suffix: "" },
  { label: "Open rate", value: 58, prefix: "", suffix: "%" },
  { label: "Recovered revenue", value: 47230, prefix: "$", suffix: "" },
];

export const SceneResults: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = useEnter(5);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 100 }}>
      <div
        style={{
          opacity: s1,
          fontSize: 26,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: colors.accent,
          marginBottom: 12,
        }}
      >
        Results
      </div>
      <div
        style={{
          opacity: s1,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 80,
          letterSpacing: -2,
          color: colors.text,
          marginBottom: 60,
          textAlign: "center",
        }}
      >
        Revenue you can <span style={{ background: colors.brand, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>measure</span>.
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {stats.map((s, i) => (
          <StatCard key={i} stat={s} delay={40 + i * 25} frame={frame} />
        ))}
      </div>

      <Chart frame={frame} />
    </AbsoluteFill>
  );
};

const StatCard: React.FC<{ stat: typeof stats[0]; delay: number; frame: number }> = ({ stat, delay, frame }) => {
  const s = useEnter(delay);
  const val = Math.round(
    interpolate(frame, [delay + 5, delay + 70], [0, stat.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
        width: 380,
        padding: 36,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 24,
      }}
    >
      <div style={{ fontSize: 20, color: colors.muted, marginBottom: 16 }}>{stat.label}</div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 70,
          letterSpacing: -1.5,
          background: colors.brand,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {stat.prefix}
        {val.toLocaleString()}
        {stat.suffix}
      </div>
    </div>
  );
};

const Chart: React.FC<{ frame: number }> = ({ frame }) => {
  const s = useEnter(150);
  const points = [40, 45, 55, 50, 65, 75, 70, 85, 95, 110, 120, 135];
  const w = 1200;
  const h = 200;
  const max = 140;
  const step = w / (points.length - 1);
  const progress = interpolate(frame, [160, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const visibleCount = Math.max(2, Math.ceil(points.length * progress));
  const path = points
    .slice(0, visibleCount)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");

  return (
    <div style={{ opacity: s, marginTop: 50, width: w }}>
      <svg width={w} height={h + 20}>
        <defs>
          <linearGradient id="line" x1="0" x2="1">
            <stop offset="0" stopColor="#a855f7" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#a855f7" stopOpacity="0.35" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${(visibleCount - 1) * step} ${h} L 0 ${h} Z`} fill="url(#fill)" />
        <path d={path} stroke="url(#line)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};
