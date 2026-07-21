"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ChapterPage } from "@/data/chapters";
import BookPage from "./BookPage";

type BookSpreadProps = {
  spreadIndex: number;
  left: ChapterPage | null;
  right: ChapterPage | null;
  leftNumber: number;
  rightNumber: number;
  direction: 1 | -1;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
};

export default function BookSpread({
  spreadIndex,
  left,
  right,
  leftNumber,
  rightNumber,
  direction,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: BookSpreadProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="book-spread" aria-live="polite" style={{ perspective: 1400 }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={spreadIndex}
          className="book-spread__inner"
          custom={direction}
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { rotateY: direction * -35, opacity: 0.5 }
          }
          animate={{ rotateY: 0, opacity: 1 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { rotateY: direction * 35, opacity: 0.5 }
          }
          transition={{
            duration: reduceMotion ? 0.01 : 0.45,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ transformOrigin: "center center" }}
        >
          <div className="book-spread__shadow" aria-hidden />
          <div className="book-spread__gutter" aria-hidden />

          <BookPage
            page={left}
            pageNumber={leftNumber}
            side="left"
            showEdgeHit={canPrev}
            onEdgeNavigate={onPrev}
          />
          <BookPage
            page={right}
            pageNumber={rightNumber}
            side="right"
            showEdgeHit={canNext}
            onEdgeNavigate={onNext}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
