"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type WorkItem } from "@/data/portfolioContent";

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

/** Full-track durations for Side A — keyed by existing work id / order */
const SIDE_A_DURATIONS: Record<number, string> = {
  1: "03:28", // Utopia
  2: "03:09", // 橘子汽水
  3: "03:03", // 融化
  4: "02:57", // 那我呢
  5: "03:29", // Fire the hole
  6: "03:38", // 浪漫因子
};

type HearSideAProps = {
  works: readonly WorkItem[];
  selectedId: number;
  playingId: number | null;
  clipElapsed: number;
  clipProgress: number;
  onSelect: (id: number) => void;
  onToggleAudition: (id: number) => void;
  onBackToRecord: () => void;
  onTurnToB: () => void;
};

export default function HearSideA({
  works,
  selectedId,
  playingId,
  clipElapsed,
  clipProgress,
  onSelect,
  onToggleAudition,
  onBackToRecord,
  onTurnToB,
}: HearSideAProps) {
  const reduceMotion = useReducedMotion();
  const selected = works.find((w) => w.id === selectedId) ?? works[0];

  return (
    <section className="hear-side hear-side--a" aria-labelledby="hear-side-a-title">
      <div className="hear-side__bar">
        <button type="button" className="hear-side__back" onClick={onBackToRecord}>
          <span className="hear-side__back-cn">回到唱片</span>
          <span className="hear-side__back-en">BACK TO RECORD</span>
        </button>
        <span className="hear-side__meta">SIDE A · 6 TRACKS</span>
      </div>

      <header className="hear-side__head">
        <span className="hear-side__index">01 / A 面</span>
        <h2 id="hear-side-a-title" className="hear-side__title">
          从空白轨道开始
        </h2>
        <span className="hear-side__en" aria-hidden>
          MADE IN DAW
        </span>
        <p className="hear-side__lead">
          先有一个模糊的声音，
          <br />
          然后我把它一轨一轨做出来。
        </p>
      </header>

      <div className="hear-side__layout">
        <div className="hear-side__now">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="hear-side__cover">
                <Image
                  src={selected.image}
                  alt={`${selected.label} 封面`}
                  fill
                  sizes="(max-width: 1023px) 72vw, 22rem"
                  priority
                />
              </div>
              <div className="hear-side__now-body">
                <h3 className="hear-side__now-title">
                  {selected.label}
                  {selected.subtitle ? (
                    <span className="hear-side__now-sub"> {selected.subtitle}</span>
                  ) : null}
                </h3>
                <p className="hear-side__now-note">{selected.type}</p>
                {selected.roles?.length ? (
                  <p className="hear-side__now-roles">{selected.roles.join(" · ")}</p>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <ol className="hear-tracklist" aria-label="A 面曲目表">
          {works.map((work, index) => {
            const active = work.id === selectedId;
            const playing = work.id === playingId;
            const label = playing
              ? `Ⅱ ${pad2(Math.min(20, Math.floor(clipElapsed)))}s`
              : "试听20s";

            return (
              <li
                key={work.id}
                className={`hear-track${active ? " is-active" : ""}${playing ? " is-playing" : ""}`}
                onClick={() => onSelect(work.id)}
              >
                <span className="hear-track__num" aria-hidden>
                  {pad2(index + 1)}
                </span>
                <span className="hear-track__name">{work.label}</span>
                <span className="hear-track__dur">{SIDE_A_DURATIONS[work.id] ?? "—:—"}</span>
                <button
                  type="button"
                  className="hear-track__audition"
                  aria-label={
                    playing
                      ? `暂停 ${work.label} 试听`
                      : `试听 ${work.label} 20秒`
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleAudition(work.id);
                  }}
                >
                  {label}
                </button>
                {playing ? (
                  <span
                    className="hear-track__progress"
                    style={{ transform: `scaleX(${clipProgress})` }}
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <footer className="hear-side__foot">
        <button type="button" className="hear-side__foot-link" onClick={onBackToRecord}>
          <span className="hear-side__foot-cn">回到唱片</span>
          <span className="hear-side__foot-en">BACK TO RECORD</span>
        </button>
        <button type="button" className="hear-side__foot-link" onClick={onTurnToB}>
          <span className="hear-side__foot-cn">另一面，不再从空白开始。</span>
          <span className="hear-side__foot-en">TURN TO SIDE B</span>
        </button>
      </footer>
    </section>
  );
}
