"use client";

import type { ChapterPage } from "@/data/chapters";
import TrackTitleList from "./TrackTitleList";

type BookPageProps = {
  page: ChapterPage | null;
  pageNumber: number;
  side: "left" | "right" | "single";
  /** When true, page edge click zones are interactive for navigation */
  showEdgeHit?: boolean;
  onEdgeNavigate?: () => void;
  className?: string;
};

export default function BookPage({
  page,
  pageNumber,
  side,
  showEdgeHit = false,
  onEdgeNavigate,
  className = "",
}: BookPageProps) {
  const isBlank = page === null;
  const edgeSide =
    side === "single" ? null : side === "left" ? "prev" : "next";
  const showTracks = page?.id === "selected-works";

  return (
    <article
      className={`book-page book-page--${side} ${className}`.trim()}
      aria-label={
        isBlank
          ? `Blank page ${pageNumber}`
          : `${page.title}, page ${pageNumber}`
      }
    >
      <div className="book-page__paper" aria-hidden={isBlank}>
        {!isBlank && (
          <>
            <header className="book-page__header">
              <span className="book-page__kicker">{page.kicker}</span>
              <h2 className="book-page__title">{page.title}</h2>
            </header>

            <div className="book-page__body">
              {page.body.map((paragraph, index) => (
                <p key={`${page.id}-${index}`}>{paragraph}</p>
              ))}
              {showTracks ? <TrackTitleList /> : null}
              {page.note ? (
                <p className="book-page__note">{page.note}</p>
              ) : null}
            </div>
          </>
        )}

        <footer className="book-page__footer">
          <span className="book-page__number">{String(pageNumber).padStart(2, "0")}</span>
        </footer>
      </div>

      {showEdgeHit && edgeSide && onEdgeNavigate ? (
        <button
          type="button"
          className={`book-page__edge book-page__edge--${edgeSide}`}
          aria-label={edgeSide === "prev" ? "Previous page" : "Next page"}
          onClick={onEdgeNavigate}
        />
      ) : null}
    </article>
  );
}
