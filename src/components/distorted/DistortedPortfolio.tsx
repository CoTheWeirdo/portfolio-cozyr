"use client";

import { useEffect, useState } from "react";
import DistortedLink, {
  type DistortedDeco,
} from "@/components/distorted/DistortedLink";
import { chapters, type ChapterId } from "@/data/chapters";
import { works } from "@/lib/works";

const CHAPTER_DECOS: DistortedDeco[] = [
  "line",
  "circle",
  "box",
  "linethrough",
  "twolines",
  "diagonal",
  "line",
];

const WORK_DECOS: DistortedDeco[] = [
  "line",
  "circle",
  "box",
  "linethrough",
  "twolines",
  "diagonal",
  "line",
  "circle",
];

export default function DistortedPortfolio() {
  const [activeId, setActiveId] = useState<ChapterId | null>(null);
  const active = chapters.find((chapter) => chapter.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId) return;
    const node = document.getElementById(`section-${activeId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeId]);

  return (
    <main className="dle">
      <header className="dle-frame">
        <h1 className="dle-frame__brand">Nicole</h1>
        <p className="dle-frame__lead">
          Selected works — music, visual, and process. 2020—2026.
        </p>
        <nav className="dle-frame__links" aria-label="Meta">
          <DistortedLink href="#index" deco="line">
            Index
          </DistortedLink>
          <DistortedLink href="#works" deco="line">
            Works
          </DistortedLink>
          <DistortedLink href="#contact" deco="line">
            Contact
          </DistortedLink>
        </nav>
      </header>

      <section id="index" className="dle-block" aria-labelledby="index-title">
        <h2 id="index-title" className="dle-block__title">
          Index
        </h2>
        <nav className="dle-menu dle-menu--line" aria-label="Chapters">
          {chapters.map((chapter, index) => (
            <DistortedLink
              key={chapter.id}
              as="button"
              type="button"
              className="dle-menu__link"
              deco={CHAPTER_DECOS[index % CHAPTER_DECOS.length]}
              aria-pressed={activeId === chapter.id}
              onClick={() => setActiveId(chapter.id)}
            >
              {chapter.title}
            </DistortedLink>
          ))}
        </nav>

        {active ? (
          <article
            id={`section-${active.id}`}
            className="dle-panel"
            aria-live="polite"
          >
            <p className="dle-panel__kicker">{active.kicker}</p>
            <h3 className="dle-panel__heading">{active.title}</h3>
            {active.body.map((paragraph, index) => (
              <p key={`${active.id}-${index}`} className="dle-panel__copy">
                {paragraph}
              </p>
            ))}
            {active.note ? (
              <p className="dle-panel__note">{active.note}</p>
            ) : null}
          </article>
        ) : null}
      </section>

      <section id="works" className="dle-block" aria-labelledby="works-title">
        <h2 id="works-title" className="dle-block__title">
          Selected tracks
        </h2>
        <nav className="dle-menu dle-menu--circle" aria-label="Selected tracks">
          {works.map((work, index) => (
            <DistortedLink
              key={work.id}
              href={`#track-${work.id}`}
              className="dle-menu__link"
              deco={WORK_DECOS[index % WORK_DECOS.length]}
              id={`track-${work.id}`}
            >
              {work.title}
            </DistortedLink>
          ))}
        </nav>
      </section>

      <section
        id="contact"
        className="dle-block dle-block--last"
        aria-labelledby="contact-title"
      >
        <h2 id="contact-title" className="dle-block__title">
          Reach out
        </h2>
        <nav className="dle-menu dle-menu--line" aria-label="Contact">
          <DistortedLink
            href="mailto:hello@cozyr.studio"
            className="dle-menu__link"
            deco="line"
            distortText
          >
            hello@cozyr.studio
          </DistortedLink>
          <DistortedLink
            href="#index"
            className="dle-menu__link"
            deco="diagonal"
            distortText
          >
            Back to index
          </DistortedLink>
        </nav>
      </section>
    </main>
  );
}
