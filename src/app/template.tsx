"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, ViewTransition } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "instant" });
  }, [reduceMotion]);

  return (
    <ViewTransition
      default="none"
      enter={{
        "nav-forward": "portfolio-page-enter",
        "nav-back": "portfolio-page-enter",
        default: "portfolio-page-enter",
      }}
      exit={{
        "nav-forward": "portfolio-page-exit",
        "nav-back": "portfolio-page-exit",
        default: "portfolio-page-exit",
      }}
    >
      {children}
    </ViewTransition>
  );
}
