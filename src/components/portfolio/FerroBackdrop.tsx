"use client";

import { useReducedMotion } from "framer-motion";
import Ferrofluid from "@/components/react-bits/Ferrofluid";

export type FerroScene = "intro" | "works" | "process" | "about";

const scenes: Record<
  FerroScene,
  {
    colors: string[];
    speed: number;
    scale: number;
    turbulence: number;
    flowDirection: "up" | "down" | "left" | "right";
    opacity: number;
    mouseStrength: number;
  }
> = {
  intro: {
    colors: ["#603388", "#b9b4d8", "#1a5f7a", "#ede9df"],
    speed: 0.42,
    scale: 1.35,
    turbulence: 0.9,
    flowDirection: "down",
    opacity: 0.85,
    mouseStrength: 0.85,
  },
  works: {
    colors: ["#b9b4d8", "#5b7fd4", "#c45ba8", "#ede9df"],
    speed: 0.38,
    scale: 1.55,
    turbulence: 0.75,
    flowDirection: "left",
    opacity: 0.7,
    mouseStrength: 0.7,
  },
  process: {
    colors: ["#1a5f7a", "#603388", "#b9b4d8"],
    speed: 0.32,
    scale: 1.7,
    turbulence: 1.05,
    flowDirection: "up",
    opacity: 0.65,
    mouseStrength: 0.6,
  },
  about: {
    colors: ["#ede9df", "#b9b4d8", "#603388"],
    speed: 0.28,
    scale: 1.45,
    turbulence: 0.7,
    flowDirection: "right",
    opacity: 0.6,
    mouseStrength: 0.55,
  },
};

type FerroBackdropProps = {
  scene: FerroScene;
  className?: string;
};

export default function FerroBackdrop({ scene, className = "" }: FerroBackdropProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  const config = scenes[scene];

  return (
    <div
      className={[
        "ferro-backdrop",
        scene === "intro" ? "ferro-backdrop--left" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <Ferrofluid
        colors={config.colors}
        speed={config.speed}
        scale={config.scale}
        turbulence={config.turbulence}
        fluidity={0.14}
        rimWidth={0.22}
        sharpness={2.8}
        shimmer={1.15}
        glow={1.7}
        flowDirection={config.flowDirection}
        opacity={config.opacity}
        mouseInteraction
        mouseStrength={config.mouseStrength}
        mouseRadius={0.28}
        mixBlendMode="screen"
      />
      <div className="ferro-backdrop__scrim" />
    </div>
  );
}
