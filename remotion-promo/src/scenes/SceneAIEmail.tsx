import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DISPLAY, BODY, colors, useEnter } from "../MainVideo";

const lines = [
  "Subject: Sarah, your linen set called — it misses a friend 💜",
  "",
  "Hi Sarah,",
  "",
  "Loving your new Cozy Wool Throw? Based on what you picked,",
  "we thought the Aromatic Soy Candle would be a perfect match —",
  "calming scent, same warm palette.",
  "",
  "→ View product",
];

export const SceneAIEmail: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = useEnter(5);
  const s2 = useEnter(40);

  // Typewriter
  const totalChars = lines.join("\n").length;
  const typed = Math.round(interpolate(frame, [60, 280], [0, totalChars], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const visible = lines.join("\n").slice(0, typed);
  const cursor = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div
        style={{
          opacity: s1,
          fontSize: 26,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: colors.accent,
          marginBottom: 14,
        }}
      >
        AI writes. You don't.
      </div>
      <div
        style={{
          opacity: s1,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 72,
          letterSpacing: -1.5,
          color: colors.text,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        Personalized to every customer.
      </div>

      <div
        style={{
          opacity: s2,
          transform: `scale(${interpolate(s2, [0, 1], [0.95, 1])})`,
          width: 1100,
          minHeight: 420,
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
          overflow: "hidden",
          fontFamily: BODY,
        }}
      >
        <div
          style={{
            background: "#f4f4f8",
            padding: "18px 28px",
            display: "flex",
            gap: 8,
            alignItems: "center",
            borderBottom: "1px solid #e5e5ec",
          }}
        >
          <Dot color="#ff5f57" />
          <Dot color="#febc2e" />
          <Dot color="#28c840" />
          <div style={{ marginLeft: 20, color: "#8a8a96", fontSize: 16 }}>
            Reorbit · AI-generated email
          </div>
        </div>
        <div
          style={{
            padding: 40,
            color: "#15152a",
            fontSize: 22,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            fontFamily: BODY,
          }}
        >
          {visible}
          {cursor && <span style={{ color: colors.primary }}>▌</span>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 14, height: 14, borderRadius: "50%", background: color }} />
);
