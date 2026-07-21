"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  chapters,
  getSpreadCount,
  getSpreadPages,
  totalChapterPages,
} from "@/data/chapters";
import BookCover from "./BookCover";
import BookPage from "./BookPage";
import BookSpread from "./BookSpread";
import ChapterLinks from "./ChapterLinks";
import PageNavigation from "./PageNavigation";

const DESKTOP_MQ = "(min-width: 900px)";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export default function BookShell() {
  const isDesktop = useIsDesktop();
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const spreadCount = getSpreadCount();
  const maxPage = totalChapterPages - 1;

  const canPrev = isDesktop ? spreadIndex > 0 : pageIndex > 0;
  const canNext = isDesktop
    ? spreadIndex < spreadCount - 1
    : pageIndex < maxPage;

  const goPrev = useCallback(() => {
    if (isDesktop) {
      if (spreadIndex <= 0) return;
      setDirection(-1);
      setSpreadIndex((n) => n - 1);
      return;
    }
    if (pageIndex <= 0) return;
    setDirection(-1);
    setPageIndex((n) => n - 1);
  }, [isDesktop, pageIndex, spreadIndex]);

  const goNext = useCallback(() => {
    if (isDesktop) {
      if (spreadIndex >= spreadCount - 1) return;
      setDirection(1);
      setSpreadIndex((n) => n + 1);
      return;
    }
    if (pageIndex >= maxPage) return;
    setDirection(1);
    setPageIndex((n) => n + 1);
  }, [isDesktop, maxPage, pageIndex, spreadCount, spreadIndex]);

  const openBook = useCallback(() => {
    setIsOpen(true);
    setPageIndex(0);
    setSpreadIndex(0);
    setDirection(1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, isOpen]);

  const [left, right] = getSpreadPages(spreadIndex);
  const statusLabel = isDesktop
    ? `Spread ${spreadIndex + 1} of ${spreadCount}`
    : `Page ${pageIndex + 1} of ${totalChapterPages}`;

  const turnTransition = {
    duration: reduceMotion ? 0.01 : 0.45,
    ease: [0.25, 0.1, 0.25, 1] as const,
  };

  return (
    <div className="book-shell">
      <div className="book-shell__atmosphere" aria-hidden />

      <div className="book-shell__stage">
        {!isOpen ? (
          <BookCover onOpen={openBook} />
        ) : (
          <div
            className="book-shell__interior"
            role="region"
            aria-label="Portfolio book"
          >
            {isDesktop ? (
              <BookSpread
                spreadIndex={spreadIndex}
                left={left}
                right={right}
                leftNumber={spreadIndex * 2 + 1}
                rightNumber={spreadIndex * 2 + 2}
                direction={direction}
                onPrev={goPrev}
                onNext={goNext}
                canPrev={canPrev}
                canNext={canNext}
              />
            ) : (
              <div className="book-mobile" style={{ perspective: 1200 }}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={pageIndex}
                    custom={direction}
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { rotateY: direction * -40, opacity: 0.4 }
                    }
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { rotateY: direction * 40, opacity: 0.4 }
                    }
                    transition={turnTransition}
                    style={{ transformOrigin: "center center" }}
                  >
                    <BookPage
                      page={chapters[pageIndex]}
                      pageNumber={pageIndex + 1}
                      side="single"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Chapter jump wiring reserved — DistortedLink UI only for now */}
            <ChapterLinks />

            <PageNavigation
              onPrev={goPrev}
              onNext={goNext}
              canPrev={canPrev}
              canNext={canNext}
              label={statusLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
