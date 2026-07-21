"use client";

import DistortedLink from "@/components/distorted/DistortedLink";

type BookCoverProps = {
  onOpen: () => void;
};

export default function BookCover({ onOpen }: BookCoverProps) {
  return (
    <div className="book-cover">
      <div className="book-cover__face">
        <div className="book-cover__grain" aria-hidden />

        <div className="book-cover__content">
          <p className="book-cover__name">Yz香菜</p>
          <p className="book-cover__subtitle">Selected Works</p>
          <p className="book-cover__years">2020—2026</p>
          <p className="book-cover__tags">Music · Visual · Process</p>
        </div>

        <DistortedLink
          as="button"
          type="button"
          className="book-cover__open"
          onClick={onOpen}
          aria-label="Open the book"
          decoAlwaysVisible
        >
          Open
        </DistortedLink>
      </div>
    </div>
  );
}
