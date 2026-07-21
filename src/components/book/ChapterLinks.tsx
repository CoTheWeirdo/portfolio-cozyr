"use client";

import DistortedLink from "@/components/distorted/DistortedLink";
import { chapters } from "@/data/chapters";

type ChapterLinksProps = {
  /** Reserved for future jump-to-chapter wiring — unused for now */
  onSelectChapter?: (chapterId: string) => void;
  className?: string;
};

/**
 * Chapter index using DistortedLink.
 * Does not change book page/spread state until onSelectChapter is wired.
 */
export default function ChapterLinks({
  onSelectChapter,
  className = "",
}: ChapterLinksProps) {
  return (
    <nav
      className={["chapter-links", className].filter(Boolean).join(" ")}
      aria-label="Chapters"
    >
      {chapters.map((chapter) => (
        <DistortedLink
          key={chapter.id}
          as="button"
          type="button"
          className="chapter-links__item"
          aria-label={`Chapter: ${chapter.title}`}
          onClick={() => onSelectChapter?.(chapter.id)}
        >
          {chapter.title}
        </DistortedLink>
      ))}
    </nav>
  );
}
