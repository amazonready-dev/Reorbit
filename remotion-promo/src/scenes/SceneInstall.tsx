import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DISPLAY, colors, useEnter } from "../MainVideo";

const steps = [
  { n: "1", t: "Install from Shopify App Store", d: "One click. No code." },
  { n: "2", t: "Connect your store", d: "We sync orders & customers automatically." },
  { n: "3", t: "You're live", d: "AI starts writing emails in under 5 minutes." },
];

export const SceneInstall: React.FC = () => {
  const s1 = useEnter(5);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div
        style={{
          opacity: s1,
          fontSize: 28,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: colors.accent,
          marginBottom: 16,
        }}
      >
        Merchant Setup
      </div>
      <div
        style={{
          opacity: s1,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 88,
          letterSpacing: -2,
          color: colors.text,
          marginBottom: 60,
        }}
      >
        Live in 5 minutes.
      </div>
      <div style={{ display: "flex", gap: 32, width: "100%", justifyContent: "center" }}>
        {steps.map((step, i) => (
          <StepCard key={i} step={step} delay={50 + i * 30} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const StepCard: React.FC<{ step: typeof steps[0]; delay: number }> = ({ step, delay }) => {
  const s = useEnter(delay);
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
        width: 420,
        padding: 36,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 24,
        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: colors.brand,
          display: "grid",
          placeItems: "center",
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 30,
          color: "white",
          marginBottom: 24,
        }}
      >
        {step.n}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 30,
          color: colors.text,
          marginBottom: 12,
        }}
      >
        {step.t}
      </div>
      <div style={{ fontSize: 20, color: colors.muted, lineHeight: 1.5 }}>{step.d}</div>
    </div>
  );
};
