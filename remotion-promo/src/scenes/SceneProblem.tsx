import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DISPLAY, colors, useEnter } from "../MainVideo";

export const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = useEnter(5);
  const s2 = useEnter(40);
  const count = Math.round(interpolate(frame, [40, 110], [0, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const s3 = useEnter(130);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div
        style={{
          opacity: s1,
          fontSize: 28,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: colors.accent,
          marginBottom: 24,
        }}
      >
        The Problem
      </div>
      <div
        style={{
          opacity: s2,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 280,
          lineHeight: 1,
          letterSpacing: -8,
          background: colors.brand,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {count}%
      </div>
      <div
        style={{
          opacity: s3,
          marginTop: 32,
          fontFamily: DISPLAY,
          fontWeight: 500,
          fontSize: 52,
          color: colors.text,
          textAlign: "center",
          maxWidth: 1200,
        }}
      >
        of your customers never come back.
      </div>
      <div
        style={{
          opacity: s3,
          marginTop: 20,
          fontSize: 26,
          color: colors.muted,
        }}
      >
        You paid to acquire them. You're losing them.
      </div>
    </AbsoluteFill>
  );
};
