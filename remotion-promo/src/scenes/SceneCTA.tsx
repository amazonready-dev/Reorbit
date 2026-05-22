import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DISPLAY, colors, useEnter } from "../MainVideo";

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = useEnter(5);
  const s2 = useEnter(40);
  const pulse = 1 + Math.sin(frame / 10) * 0.03;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div
        style={{
          opacity: s1,
          transform: `scale(${interpolate(s1, [0, 1], [0.7, pulse])})`,
          width: 180,
          height: 180,
          borderRadius: 48,
          background: colors.brand,
          display: "grid",
          placeItems: "center",
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 100,
          color: "white",
          boxShadow: "0 30px 100px rgba(168,85,247,0.6)",
          marginBottom: 40,
        }}
      >
        R
      </div>
      <div
        style={{
          opacity: s2,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 140,
          letterSpacing: -3,
          background: colors.brand,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Reorbit
      </div>
      <div
        style={{
          opacity: s2,
          marginTop: 20,
          fontSize: 36,
          color: colors.muted,
          letterSpacing: 0.5,
        }}
      >
        reorbit.dev
      </div>
    </AbsoluteFill>
  );
};
