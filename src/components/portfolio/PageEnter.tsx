"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type PageEnterProps = {
  children: ReactNode;
  className?: string;
  /** Seconds after mount before this block starts entering */
  delay?: number;
  /** Slightly stronger blur/travel for hero titles */
  emphasis?: "copy" | "title" | "soft";
};

/**
 * Intro-like text entrance for route pages.
 * Prefer this over whole-page View Transitions (those read as PPT slides).
 */
export default function PageEnter({
  children,
  className,
  delay = 0,
  emphasis = "copy",
}: PageEnterProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const travel =
    emphasis === "title" ? 28 : emphasis === "soft" ? 14 : 20;
  const blur =
    emphasis === "title" ? 12 : emphasis === "soft" ? 6 : 8;
  const duration =
    emphasis === "title" ? 1.05 : emphasis === "soft" ? 0.78 : 0.9;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: travel, filter: `blur(${blur}px)` }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
