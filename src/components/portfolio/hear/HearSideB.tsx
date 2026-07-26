"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { autoRenewalCase } from "@/data/autoRenewalCase";

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

const aiTracks = [
  {
    id: autoRenewalCase.id,
    title: autoRenewalCase.title,
    cover: autoRenewalCase.cover,
    coverAlt: autoRenewalCase.coverAlt,
    audio: autoRenewalCase.audio,
    duration: autoRenewalCase.displayDuration,
    note: autoRenewalCase.oneLiner.join(""),
    actions: "写词 · 定方向 · 选版本",
    versionNote: `最后留下第 ${autoRenewalCase.selection.selectedVersion.replace(/\D/g, "") || "6"} 版`,
  },
  {
    id: "hou",
    title: "候",
    cover: "/assets/works/hou/hou-cover.jpeg",
    coverAlt: "候 封面",
    audio: "/audio/hou/hou-preview.mp3",
    duration: "03:49",
    note: "",
    actions: "",
    versionNote: "",
  },
  {
    id: "blue-again",
    title: "Blue Again",
    cover: "/assets/works/blue-again/blue-again-cover.png",
    coverAlt: "Blue Again 封面",
    audio: "/audio/blue-again/blue-again-preview.mp3",
    duration: "03:48",
    note: "",
    actions: "",
    versionNote: "",
  },
] as const;

type HearSideBProps = {
  selectedId: string;
  playingId: string | null;
  clipElapsed: number;
  clipProgress: number;
  onSelect: (id: string) => void;
  onToggleAudition: (id: string) => void;
  onBackToRecord: () => void;
  onBackToA?: () => void;
};

export default function HearSideB({
  selectedId,
  playingId,
  clipElapsed,
  clipProgress,
  onSelect,
  onToggleAudition,
  onBackToRecord,
  onBackToA,
}: HearSideBProps) {
  const reduceMotion = useReducedMotion();
  const selected = aiTracks.find((t) => t.id === selectedId) ?? aiTracks[0];

  return (
    <section className="hear-side hear-side--b" aria-labelledby="hear-side-b-title">
      <div className="hear-side__bar">
        <button type="button" className="hear-side__back" onClick={onBackToRecord}>
          <span className="hear-side__back-cn">回到唱片</span>
          <span className="hear-side__back-en">BACK TO RECORD</span>
        </button>
        <span className="hear-side__meta">SIDE B · AI TRACKS</span>
      </div>

      <header className="hear-side__head">
        <span className="hear-side__index">02 / B 面</span>
        <h2 id="hear-side-b-title" className="hear-side__title">
          从很多版本里，留下这一首
        </h2>
        <span className="hear-side__en" aria-hidden>
          MADE WITH AI
        </span>
        <p className="hear-side__lead">
          我写词、定方向，也一版版听，
          <br />
          直到知道哪一首值得留下。
        </p>
      </header>

      <div className="hear-side__layout hear-side__layout--mirror">
        <ol className="hear-tracklist" aria-label="B 面曲目表">
          {aiTracks.map((track, index) => {
            const active = track.id === selectedId;
            const playing = track.id === playingId;
            const label = playing
              ? `Ⅱ ${pad2(Math.min(20, Math.floor(clipElapsed)))}s`
              : "试听20s";

            return (
              <li
                key={track.id}
                className={`hear-track${active ? " is-active" : ""}${playing ? " is-playing" : ""}`}
                onClick={() => onSelect(track.id)}
              >
                <span className="hear-track__num" aria-hidden>
                  {pad2(index + 1)}
                </span>
                <span className="hear-track__name">{track.title}</span>
                <span className="hear-track__dur">{track.duration}</span>
                <button
                  type="button"
                  className="hear-track__audition"
                  aria-label={
                    playing
                      ? `暂停 ${track.title} 试听`
                      : `试听 ${track.title} 20秒`
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleAudition(track.id);
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
                  src={selected.cover}
                  alt={selected.coverAlt}
                  fill
                  sizes="(max-width: 1023px) 72vw, 22rem"
                  priority
                />
              </div>
              <div className="hear-side__now-body">
                <h3 className="hear-side__now-title">{selected.title}</h3>
                {selected.note ? <p className="hear-side__now-note">{selected.note}</p> : null}
                {selected.actions ? <p className="hear-side__now-roles">{selected.actions}</p> : null}
                {selected.versionNote ? (
                  <p className="hear-side__now-version">{selected.versionNote}</p>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="hear-side__foot">
        <button type="button" className="hear-side__foot-link" onClick={onBackToRecord}>
          <span className="hear-side__foot-cn">回到唱片</span>
          <span className="hear-side__foot-en">BACK TO RECORD</span>
        </button>
        {onBackToA ? (
          <button type="button" className="hear-side__foot-mid" onClick={onBackToA}>
            回到 A 面
          </button>
        ) : null}
        <Link className="hear-side__foot-link" href="/process">
          <span className="hear-side__foot-cn">看它怎么成形 ↗</span>
          <span className="hear-side__foot-en">TO PROCESS</span>
        </Link>
      </footer>
    </section>
  );
}

export { aiTracks };
