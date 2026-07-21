"use client";

import DistortedLink from "@/components/distorted/DistortedLink";
import { works } from "@/lib/works";

type TrackTitleListProps = {
  className?: string;
};

/** Selected track titles with DistortedLink underlines — no playback wiring yet. */
export default function TrackTitleList({ className = "" }: TrackTitleListProps) {
  return (
    <ul
      className={["track-list", className].filter(Boolean).join(" ")}
      aria-label="Selected tracks"
    >
      {works.map((work) => (
        <li key={work.id} className="track-list__row">
          <DistortedLink
            href={`#track-${work.id}`}
            className="track-list__title"
            decoAlwaysVisible
          >
            {work.title}
          </DistortedLink>
          <span className="track-list__year">{work.year}</span>
        </li>
      ))}
    </ul>
  );
}
