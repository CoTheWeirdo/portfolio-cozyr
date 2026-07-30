"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, ViewTransition } from "react";

/**
 * Keep route-level View Transitions nearly invisible.
 * Real motion lives in PageEnter (staggered text), matching Intro.
 * A hard full-page fade/slide reads like PPT.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "instant" });
  }, [reduceMotion]);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <ViewTransition default="none" enter="none" exit="none">
      {children}
    </ViewTransition>
  );
}
