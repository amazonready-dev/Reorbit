import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DISPLAY, colors, useEnter } from "../MainVideo";

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = useEnter(10);
  const s2 = useEnter(40);
  const s3 = useEnter(80);
  const pulse = 1 + Math.sin(frame / 20) * 0.02;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div
        style={{
          opacity: s1,
          transform: `scale(${interpolate(s1, [0, 1], [0.8, 1])})`,
          marginBottom: 40,
        }}
      >
        <LogoMark scale={pulse} />
      </div>
      <div
        style={{
          opacity: s2,
          transform: `translateY(${interpolate(s2, [0, 1], [30, 0])}px)`,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 120,
          lineHeight: 1.05,
          letterSpacing: -2,
          color: colors.text,
          maxWidth: 1400,
        }}
      >
        Turn one-time buyers <br />
        into{" "}
        <span
          style={{
            background: colors.brand,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          repeat revenue
        </span>
        .
      </div>
      <div
        style={{
          opacity: s3,
          marginTop: 36,
          fontSize: 32,
          color: colors.muted,
          letterSpacing: 0.5,
        }}
      >
        AI post-purchase emails for Shopify
      </div>
    </AbsoluteFill>
  );
};

const LogoMark: React.FC<{ scale: number }> = ({ scale }) => (
  <div
    style={{
      width: 140,
      height: 140,
      borderRadius: 36,
      background: colors.brand,
      transform: `scale(${scale})`,
      boxShadow: "0 20px 60px rgba(168,85,247,0.45)",
      display: "grid",
      placeItems: "center",
      fontFamily: DISPLAY,
      fontWeight: 700,
      fontSize: 80,
      color: "white",
    }}
  >
    R
  </div>
);
