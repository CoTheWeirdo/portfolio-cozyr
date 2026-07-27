"use client";

import { useEffect, useRef, useState, type AnimationEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { autoRenewalCase } from "@/data/autoRenewalCase";

const COVER_SIZES = "(max-width: 1023px) 72vw, 22rem";

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

const CLIP_SEC = 20;

const WAVE_HEIGHTS = [
  28, 46, 34, 62, 40, 72, 38, 58, 44, 68, 32, 54, 48, 76, 36, 60, 42, 70, 30, 52, 48, 64, 38, 56, 44, 66,
] as const;

function listeningLine(trackId: string): string {
  if (trackId === autoRenewalCase.id) {
    return "生活自动续费，我还没点同意";
  }
  return "20秒试听片段";
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
  const selectedIndex = Math.max(
    0,
    aiTracks.findIndex((t) => t.id === selectedId),
  );
  const selected = aiTracks[selectedIndex] ?? aiTracks[0];
  const selectedCover = selected.cover;
  const selectedNum = pad2(selectedIndex + 1);
  const isSelectedPlaying = playingId === selected.id;
  const elapsedSec = isSelectedPlaying
    ? Math.min(CLIP_SEC, Math.max(0, Math.floor(clipElapsed)))
    : 0;

  const [displayedCover, setDisplayedCover] = useState(selectedCover);
  const [incomingCover, setIncomingCover] = useState<string | null>(null);
  const selectedCoverRef = useRef(selectedCover);
  selectedCoverRef.current = selectedCover;

  const displayedAlt =
    aiTracks.find((t) => t.cover === displayedCover)?.coverAlt ?? selected.coverAlt;
  const isCoverSwapping = incomingCover !== null;

  useEffect(() => {
    const preloaders = aiTracks.map((track) => {
      const image = new window.Image();
      image.src = track.cover;
      if (typeof image.decode === "function") {
        image.decode().catch(() => {});
      }
      return image;
    });

    return () => {
      preloaders.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, []);

  useEffect(() => {
    if (selectedCover === displayedCover) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayedCover(selectedCover);
      setIncomingCover(null);
      return;
    }

    setIncomingCover(selectedCover);
  }, [selectedCover, displayedCover]);

  const handleIncomingAnimationEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.animationName !== "hear-sideb-cover-enter") return;

    const latest = selectedCoverRef.current;
    setDisplayedCover(latest);
    setIncomingCover(null);
  };

  return (
    <section className="hear-side hear-side--b" aria-labelledby="hear-side-b-title">
      <div className="hear-side__bar">
        <button type="button" className="hear-side__back" onClick={onBackToRecord}>
          <span className="hear-side__back-cn">回到唱片</span>
          <span className="hear-side__back-en">BACK TO RECORD</span>
        </button>
        <span className="hear-side__meta">SIDE B · SELECTED OUTPUTS</span>
      </div>

      <header className="hear-side__head">
        <span className="hear-side__index">02 / B 面</span>
        <h2 id="hear-side-b-title" className="hear-side__title hear-sideb-title">
          <span className="hear-sideb-title__line">从很多版本里，</span>
          <span className="hear-sideb-title__line hear-sideb-title__line--indent">
            留下能被听见的
          </span>
        </h2>
        <span className="hear-side__en" aria-hidden>
          MADE WITH AI
        </span>
        <p className="hear-side__lead">
          我写词、定方向，也一版版听，
          <br />
          直到生成的声音真正成为作品。
        </p>
      </header>

      <div className="hear-side__layout hear-side__layout--mirror">
        <div className="hear-sideb-left">
          <ol className="hear-tracklist" aria-label="B 面曲目表">
            {aiTracks.map((track, index) => {
              const active = track.id === selectedId;
              const playing = track.id === playingId;
              const label = playing
                ? `Ⅱ ${pad2(Math.min(20, Math.floor(clipElapsed)))}s`
                : "试听20s";
              const trackNum = pad2(index + 1);

              return (
                <li
                  key={track.id}
                  className={`hear-track${active ? " is-active" : ""}${playing ? " is-playing" : ""}`}
                  onClick={() => onSelect(track.id)}
                >
                  <span className="hear-track__num" aria-hidden>
                    {trackNum}
                  </span>
                  <span className="hear-track__name">
                    <span className="hear-sideb-track-label">{track.title}</span>
                    {active ? (
                      <span className="hear-sideb-selected" aria-hidden="true">
                        SELECTED / {trackNum}
                      </span>
                    ) : null}
                  </span>
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

          <aside
            className={`hear-sideb-listening${isSelectedPlaying ? " is-playing" : ""}`}
            aria-label="当前试听"
          >
            <p className="hear-sideb-listening__tag">
              NOW LISTENING / {selectedNum}
            </p>
            <p className="hear-sideb-listening__title">{selected.title}</p>
            <p className="hear-sideb-listening__line">{listeningLine(selected.id)}</p>
            <div className="hear-sideb-wave" aria-hidden="true">
              {WAVE_HEIGHTS.map((height, i) => (
                <span
                  key={i}
                  className="hear-sideb-wave__bar"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${(i % 8) * 0.08}s`,
                  }}
                />
              ))}
            </div>
            <p className="hear-sideb-listening__time">
              00:{pad2(elapsedSec)} / 00:{pad2(CLIP_SEC)}
            </p>
          </aside>
        </div>

        <div className="hear-side__now">
          <div className="hear-sideb-now-stack">
            <div className="hear-side__cover hear-sideb-cover">
              <span
                key="ghost-back"
                className="hear-sideb-cover__ghost hear-sideb-cover__ghost--2"
                aria-hidden="true"
              >
                <Image
                  src={displayedCover}
                  alt=""
                  fill
                  sizes={COVER_SIZES}
                  unoptimized
                  decoding="async"
                />
              </span>
              <span
                key="ghost-middle"
                className="hear-sideb-cover__ghost hear-sideb-cover__ghost--1"
                aria-hidden="true"
              >
                <Image
                  src={displayedCover}
                  alt=""
                  fill
                  sizes={COVER_SIZES}
                  unoptimized
                  decoding="async"
                />
              </span>
              <span
                key="cover-main"
                className={`hear-sideb-cover__main${isCoverSwapping ? " is-swapping" : ""}`}
              >
                <Image
                  src={displayedCover}
                  alt={displayedAlt}
                  fill
                  sizes={COVER_SIZES}
                  priority
                  unoptimized
                  decoding="async"
                />
              </span>
              {isCoverSwapping ? (
                <span className="hear-sideb-cover__exit" aria-hidden="true">
                  <span className="hear-sideb-cover__exit-main">
                    <Image
                      src={displayedCover}
                      alt=""
                      fill
                      sizes={COVER_SIZES}
                      unoptimized
                      decoding="async"
                    />
                  </span>
                  <span className="hear-sideb-cover__trail hear-sideb-cover__trail--1">
                    <Image
                      src={displayedCover}
                      alt=""
                      fill
                      sizes={COVER_SIZES}
                      unoptimized
                      decoding="async"
                    />
                  </span>
                  <span className="hear-sideb-cover__trail hear-sideb-cover__trail--2">
                    <Image
                      src={displayedCover}
                      alt=""
                      fill
                      sizes={COVER_SIZES}
                      unoptimized
                      decoding="async"
                    />
                  </span>
                </span>
              ) : null}
              {incomingCover ? (
                <span
                  key={incomingCover}
                  className="hear-sideb-cover__incoming"
                  onAnimationEnd={handleIncomingAnimationEnd}
                >
                  <Image
                    src={incomingCover}
                    alt=""
                    fill
                    sizes={COVER_SIZES}
                    unoptimized
                    decoding="async"
                  />
                </span>
              ) : null}
              <div className="hear-sideb-retained" aria-hidden="true">
                <span className="hear-sideb-retained__label">RETAINED</span>
                <span className="hear-sideb-retained__num">
                  {selectedNum} / 03
                </span>
              </div>
            </div>
            <div className="hear-side__now-body">
              <h3 className="hear-side__now-title">{selected.title}</h3>
              {selected.note ? <p className="hear-side__now-note">{selected.note}</p> : null}
              {selected.actions ? <p className="hear-side__now-roles">{selected.actions}</p> : null}
              {selected.versionNote ? (
                <p className="hear-side__now-version">{selected.versionNote}</p>
              ) : null}
            </div>
          </div>
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
