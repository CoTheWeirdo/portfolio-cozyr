"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "instant" });
  }, [reduceMotion]);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
