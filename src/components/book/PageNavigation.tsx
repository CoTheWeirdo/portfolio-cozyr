"use client";

type PageNavigationProps = {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  label: string;
};

export default function PageNavigation({
  onPrev,
  onNext,
  canPrev,
  canNext,
  label,
}: PageNavigationProps) {
  return (
    <nav className="book-nav" aria-label="Page navigation">
      <button
        type="button"
        className="book-nav__btn"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous page"
      >
        <span aria-hidden>←</span>
        <span className="book-nav__text">Prev</span>
      </button>

      <p className="book-nav__status" aria-live="polite">
        {label}
      </p>

      <button
        type="button"
        className="book-nav__btn"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next page"
      >
        <span className="book-nav__text">Next</span>
        <span aria-hidden>→</span>
      </button>
    </nav>
  );
}
