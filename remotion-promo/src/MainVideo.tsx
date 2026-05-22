import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

import { SceneHook } from "./scenes/SceneHook";
import { SceneProblem } from "./scenes/SceneProblem";
import { SceneInstall } from "./scenes/SceneInstall";
import { SceneAIEmail } from "./scenes/SceneAIEmail";
import { SceneCustomer } from "./scenes/SceneCustomer";
import { SceneResults } from "./scenes/SceneResults";
import { SceneCTA } from "./scenes/SceneCTA";

export const { fontFamily: DISPLAY } = loadDisplay("normal", { weights: ["500", "700"] });
export const { fontFamily: BODY } = loadBody("normal", { weights: ["400", "500", "600"] });

// 60s @ 30fps = 1800 frames
// Scenes (raw): 270+260+290+360+300+320+200 = 2000
// 6 transitions × ~33f overlap ≈ 200 → final ≈ 1800
const T = 33;
const D = [270, 260, 290, 360, 300, 320, 200];
export const TOTAL = D.reduce((a, b) => a + b, 0) - T * 6;

const scenes = [SceneHook, SceneProblem, SceneInstall, SceneAIEmail, SceneCustomer, SceneResults, SceneCTA];

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a14", fontFamily: BODY }}>
      <BackgroundLayer />
      <TransitionSeries>
        {scenes.map((Scene, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={D[i]}>
              <Scene />
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: T })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
      <Vignette />
    </AbsoluteFill>
  );
};

const BackgroundLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = Math.sin(frame / 90) * 40;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(106,62,234,0.25), transparent 50%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.18), transparent 55%), #0a0a14",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: width * 0.6 + drift,
          top: height * 0.1,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.35), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -200 - drift,
          top: height * 0.5,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.25), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(circle at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);

export const colors = {
  bg: "#0a0a14",
  surface: "#15152a",
  border: "rgba(255,255,255,0.08)",
  text: "#f5f5fa",
  muted: "#9ca3b8",
  primary: "#a855f7",
  accent: "#38bdf8",
  brand: "linear-gradient(135deg, #a855f7 0%, #6a3eea 50%, #38bdf8 100%)",
};

// Helpers
export const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 140 } });
  return s;
};
