"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import FuzzyText from "@/components/react-bits/FuzzyText";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { CLIP_DURATION_SEC, hexToRgb, works } from "@/data/portfolioContent";

export default function PortfolioWorks() {
  const reduceMotion = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);
  const worksRailRef = useRef<HTMLDivElement>(null);
  const worksSequenceRef = useRef<HTMLDivElement>(null);
  const worksRailPausedRef = useRef({ hover: false, interaction: false, focus: false, visible: false });
  const clipHoverCountRef = useRef(0);
  const dragRef = useRef({ active: false, lastX: 0, moved: false });
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipProgress, setClipProgress] = useState(0);
  const [audioMissing, setAudioMissing] = useState<number | null>(null);
  const [isDraggingWorks, setIsDraggingWorks] = useState(false);
  const playingTrack = isPlaying ? activeTrack : null;
  const activeWork = playingTrack === null ? null : works.find((work) => work.id === playingTrack);

  const syncClipProgress = useCallback((audio: HTMLAudioElement) => {
    const next = audio.currentTime / CLIP_DURATION_SEC;
    setClipProgress(Math.min(1, Math.max(0, next)));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) syncClipProgress(audio);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, syncClipProgress]);

  const listeningStyle = {
    "--listening-a": activeWork ? hexToRgb(activeWork.glow) : "185 180 216",
    "--listening-b": activeWork ? hexToRgb(activeWork.glowSoft) : "80 137 169",
    "--listening-c": activeWork ? hexToRgb(activeWork.glow) : "164 92 72",
  } as CSSProperties;

  useEffect(() => () => audioRef.current?.pause(), []);

  const normalizeWorksRail = useCallback(() => {
    const rail = worksRailRef.current;
    const sequence = worksSequenceRef.current;
    if (!rail || !sequence) return;

    const loopDistance = sequence.offsetWidth;
    if (!loopDistance) return;

    if (rail.scrollLeft < loopDistance * .5) {
      rail.scrollLeft += loopDistance;
    } else if (rail.scrollLeft >= loopDistance * 1.5) {
      rail.scrollLeft -= loopDistance;
    }
  }, []);

  useEffect(() => {
    const rail = worksRailRef.current;
    const sequence = worksSequenceRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!rail || !sequence) return;

    const placeInMiddleCopy = () => {
      const loopDistance = sequence.offsetWidth;
      if (loopDistance) rail.scrollLeft = loopDistance;
    };

    placeInMiddleCopy();
    const resizeObserver = new ResizeObserver(placeInMiddleCopy);
    let frame = 0;
    let previousTime = 0;

    const moveRail = (time: number) => {
      frame = 0;
      if (!worksRailPausedRef.current.visible) {
        previousTime = 0;
        return;
      }

      if (!previousTime) previousTime = time;
      const elapsed = Math.min(time - previousTime, 40);
      const pauseState = worksRailPausedRef.current;

      if (!pauseState.hover && !pauseState.interaction && !pauseState.focus) {
        rail.scrollLeft += elapsed * .042;
        normalizeWorksRail();
      }

      previousTime = time;
      frame = window.requestAnimationFrame(moveRail);
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      worksRailPausedRef.current.visible = entry.isIntersecting;
      if (reduceMotion) return;

      if (entry.isIntersecting && !frame) {
        frame = window.requestAnimationFrame(moveRail);
      } else if (!entry.isIntersecting && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      }
    }, { rootMargin: "160px 0px" });

    resizeObserver.observe(sequence);
    visibilityObserver.observe(rail);
    rail.addEventListener("scroll", normalizeWorksRail, { passive: true });

    if (reduceMotion) {
      return () => {
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        rail.removeEventListener("scroll", normalizeWorksRail);
      };
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      rail.removeEventListener("scroll", normalizeWorksRail);
    };
  }, [normalizeWorksRail]);

  function startWorksDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const eventTarget = event.target;
    const targetElement =
      eventTarget instanceof Element
        ? eventTarget
        : eventTarget instanceof Node
          ? eventTarget.parentElement
          : null;
    // Never start a rail drag from the clip button (incl. text-node targets).
    if (targetElement?.closest("button, a")) return;
    dragRef.current = { active: true, lastX: event.clientX, moved: false };
    worksRailPausedRef.current.interaction = true;
    setIsDraggingWorks(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveWorksDrag(event: PointerEvent<HTMLDivElement>) {
    const rail = worksRailRef.current;
    const drag = dragRef.current;
    if (!rail || !drag.active) return;

    const delta = event.clientX - drag.lastX;
    if (Math.abs(delta) > 1) drag.moved = true;
    rail.scrollLeft -= delta;
    drag.lastX = event.clientX;
    normalizeWorksRail();
  }

  function finishWorksDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    worksRailPausedRef.current.interaction = false;
    setIsDraggingWorks(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function toggleTrack(id: number, clip: string) {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrack === id) {
      if (!audio.paused) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      setAudioMissing(null);
      try {
        if (audio.ended) {
          audio.currentTime = 0;
          setClipProgress(0);
        }
        await audio.play();
        setIsPlaying(true);
      } catch {
        setActiveTrack(null);
        setIsPlaying(false);
        setAudioMissing(id);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
    audio.src = clip;
    audio.load();
    audio.currentTime = 0;
    setClipProgress(0);
    setAudioMissing(null);
    setActiveTrack(id);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setActiveTrack(null);
      setIsPlaying(false);
      setClipProgress(0);
      setAudioMissing(id);
    }
  }

  function pauseRailForHover() {
    clipHoverCountRef.current += 1;
    worksRailPausedRef.current.hover = true;
  }

  function resumeRailFromHover() {
    clipHoverCountRef.current = Math.max(0, clipHoverCountRef.current - 1);
    worksRailPausedRef.current.hover = clipHoverCountRef.current > 0;
  }

  function renderWork(work: (typeof works)[number], duplicate = false) {
    const isTrackPlaying = activeTrack === work.id && isPlaying;
    const isTrackActive = activeTrack === work.id;
    const workGlowStyle = {
      "--work-glow": hexToRgb(work.glow),
      "--work-glow-soft": hexToRgb(work.glowSoft),
    } as CSSProperties;

    return (
      <motion.article
        className={`work ${isTrackPlaying ? "work--active" : ""} ${playingTrack !== null && playingTrack !== work.id ? "work--muted" : ""}`}
        key={`${duplicate ? "loop" : "original"}-${work.id}`}
        style={workGlowStyle}
        initial={duplicate ? false : { opacity: 0, y: 30 }}
        whileInView={duplicate ? undefined : { opacity: 1, y: 0 }}
        viewport={duplicate ? undefined : { once: true, amount: .2 }}
        aria-hidden={duplicate || undefined}
      >
        <div
          className="work__image"
          onMouseEnter={pauseRailForHover}
          onMouseLeave={resumeRailFromHover}
        >
          <Image src={work.image} alt={duplicate ? "" : `${work.label} 封面`} fill sizes="(max-width: 760px) 68vw, 18vw" />
        </div>
        <div className="work__meta">
          <div>
            <span className="work__name fx-link">
              <span>{work.label}</span>
              {work.subtitle ? <span className="work__name-detail">{work.subtitle}</span> : null}
            </span>
            <span className="work__note">{work.type}</span>
          </div>
          <div
            className="clip-control"
            onMouseEnter={pauseRailForHover}
            onMouseLeave={resumeRailFromHover}
          >
            <button
              className={`clip-button ${isTrackPlaying ? "clip-button--playing" : ""}`}
              type="button"
              tabIndex={duplicate ? -1 : 0}
              aria-label={`${isTrackPlaying ? "Pause" : "Play"} ${work.label}${work.subtitle ?? ""} ${CLIP_DURATION_SEC}-second clip`}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                void toggleTrack(work.id, work.clip);
              }}
              onFocus={() => { worksRailPausedRef.current.focus = true; }}
              onBlur={() => { worksRailPausedRef.current.focus = false; }}
            >
              <span className="clip-button__icon" aria-hidden>{isTrackPlaying ? "Ⅱ" : "▶"}</span>
              <span>{isTrackPlaying ? "播放中" : "试听片段"}</span>
              <span className="clip-button__time">
                {isTrackActive
                  ? `00:${String(Math.min(CLIP_DURATION_SEC, Math.floor(clipProgress * CLIP_DURATION_SEC))).padStart(2, "0")}`
                  : `00:${String(CLIP_DURATION_SEC).padStart(2, "0")}`}
              </span>
            </button>
            <span className="clip-button__progress" aria-hidden="true">
              <span style={isTrackActive ? { transform: `scaleX(${clipProgress})` } : undefined} />
            </span>
          </div>
        </div>
        {audioMissing === work.id && !duplicate ? <p className="clip-missing">试听暂时未加载，请刷新页面后再试。</p> : null}
      </motion.article>
    );
  }

  return (
    <PortfolioShell
      className={playingTrack !== null ? "portfolio--listening portfolio--works-page" : "portfolio--works-page"}
      style={listeningStyle}
      ferro="works"
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          if (audioRef.current) syncClipProgress(audioRef.current);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setClipProgress(1);
        }}
        onLoadedMetadata={(event) => syncClipProgress(event.currentTarget)}
        onTimeUpdate={(event) => syncClipProgress(event.currentTarget)}
      />

      <motion.section
        id="works"
        className="section section--works section--works-page"
        aria-labelledby="works-title"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <header className="section__head section__head--works">
          <span className="section__kicker">01 / 精选作品</span>
          <h2 id="works-title" className="section__title section__title--cn section__title--center" aria-label="传统音乐制作">
            {reduceMotion ? (
              "传统音乐制作"
            ) : (
              <FuzzyText
                className="page-fuzzy page-fuzzy--works"
                fontSize="clamp(2.25rem, 4.4vw, 4.5rem)"
                fontWeight={600}
                fontFamily='"Hiragino Sans GB", "PingFang SC", sans-serif'
                color="#ede9df"
                baseIntensity={0.14}
                hoverIntensity={0.45}
                enableHover
                fuzzRange={22}
                fps={42}
                direction="horizontal"
                transitionDuration={8}
              >
                传统音乐制作
              </FuzzyText>
            )}
          </h2>
          <p className="section__sub">4 首原创 · 2 个编曲作品 · 横向浏览 →</p>
        </header>
        <p className="works-tune-in" aria-hidden>TUNING IN</p>
        <div
          ref={worksRailRef}
          className={`works-rail ${isDraggingWorks ? "works-rail--dragging" : ""}`}
          aria-label="可左右拖动、无限循环展示六个音乐作品，鼠标移入封面或试听片段时暂停"
          onPointerDown={startWorksDrag}
          onPointerMove={moveWorksDrag}
          onPointerUp={finishWorksDrag}
          onPointerCancel={finishWorksDrag}
        >
          <div className="works-track">
            <div className="works-sequence" aria-hidden="true">
              {works.map((work) => renderWork(work, true))}
            </div>
            <div ref={worksSequenceRef} className="works-sequence">
              {works.map((work) => renderWork(work))}
            </div>
            <div className="works-sequence" aria-hidden="true">
              {works.map((work) => renderWork(work, true))}
            </div>
          </div>
        </div>
      </motion.section>
    </PortfolioShell>
  );
}
