"use client";

import Lenis from "lenis";
import { emitScrollFrame } from "@/lib/scrollFrame";
import { useEffect } from "react";

export default function PortfolioSmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    });

    const unsubscribe = lenis.on("scroll", emitScrollFrame);

    return () => {
      unsubscribe?.();
      lenis.destroy();
    };
  }, []);

  return null;
}
