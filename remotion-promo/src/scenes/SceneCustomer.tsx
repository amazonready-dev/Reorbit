import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DISPLAY, colors, useEnter } from "../MainVideo";

export const SceneCustomer: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = useEnter(5);
  const s2 = useEnter(50);
  const s3 = useEnter(140);
  const arrow = interpolate(frame, [100, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
        Customer Flow
      </div>
      <div
        style={{
          opacity: s1,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 72,
          letterSpacing: -1.5,
          color: colors.text,
          marginBottom: 70,
          textAlign: "center",
        }}
      >
        From inbox → second order.
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <PhoneCard delay={s2} title="Inbox" body="✉ Reorbit AI" sub="Picked just for you" />
        <Arrow progress={arrow} />
        <PhoneCard delay={s3} title="Checkout" body="✓ Order #2" sub="$58.00 paid" tone="success" />
      </div>
    </AbsoluteFill>
  );
};

const PhoneCard: React.FC<{ delay: number; title: string; body: string; sub: string; tone?: "success" }> = ({
  delay,
  title,
  body,
  sub,
  tone,
}) => (
  <div
    style={{
      opacity: delay,
      transform: `scale(${interpolate(delay, [0, 1], [0.85, 1])})`,
      width: 380,
      height: 520,
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: 36,
      padding: 32,
      boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ fontSize: 20, color: colors.muted, marginBottom: 24 }}>{title}</div>
    <div
      style={{
        flex: 1,
        background: tone === "success" ? "rgba(56,189,248,0.12)" : "rgba(168,85,247,0.12)",
        borderRadius: 20,
        padding: 28,
        border: `1px solid ${tone === "success" ? "rgba(56,189,248,0.4)" : "rgba(168,85,247,0.4)"}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 44,
          color: colors.text,
          marginBottom: 12,
        }}
      >
        {body}
      </div>
      <div style={{ fontSize: 22, color: colors.muted }}>{sub}</div>
    </div>
  </div>
);

const Arrow: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width="180" height="60" viewBox="0 0 180 60">
    <defs>
      <linearGradient id="g" x1="0" x2="1">
        <stop offset="0" stopColor="#a855f7" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    <line
      x1="0"
      y1="30"
      x2={20 + progress * 130}
      y2="30"
      stroke="url(#g)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <polygon
      points={`${10 + progress * 140},20 ${30 + progress * 140},30 ${10 + progress * 140},40`}
      fill="#38bdf8"
      opacity={progress}
    />
  </svg>
);
