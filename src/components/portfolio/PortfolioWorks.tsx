"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import FuzzyText from "@/components/react-bits/FuzzyText";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import SoundToSignalBridge from "@/components/portfolio/SoundToSignalBridge";
import AiLabSection from "@/components/portfolio/AiLabSection";
import MusicEvalSystem from "@/components/portfolio/MusicEvalSystem";
import { CLIP_DURATION_SEC, hexToRgb, works } from "@/data/portfolioContent";

type TrackId = number;

function useFuzzyBreakpointSize(
  desktop: string,
  tablet: string,
  phone: string,
  tabletMax = 1199,
  phoneMax = 767,
) {
  const [size, setSize] = useState(desktop);
  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      if (w <= phoneMax) setSize(phone);
      else if (w <= tabletMax) setSize(tablet);
      else setSize(desktop);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [desktop, tablet, phone, tabletMax, phoneMax]);
  return size;
}

export default function PortfolioWorks() {
  const reduceMotion = useReducedMotion();
  const heroFuzzySize = useFuzzyBreakpointSize(
    "clamp(54px, 5.8vw, 84px)",
    "clamp(46px, 7vw, 64px)",
    "clamp(40px, 12vw, 54px)",
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const pauseCaseAudioRef = useRef<(() => void) | null>(null);
  const worksRailRef = useRef<HTMLDivElement>(null);
  const worksSequenceRef = useRef<HTMLDivElement>(null);
  const worksRailPausedRef = useRef({ hover: false, interaction: false, focus: false, visible: false });
  const clipHoverCountRef = useRef(0);
  const dragRef = useRef({ active: false, lastX: 0, moved: false });
  const [activeTrack, setActiveTrack] = useState<TrackId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipProgress, setClipProgress] = useState(0);
  const [audioMissing, setAudioMissing] = useState<TrackId | null>(null);
  const [isDraggingWorks, setIsDraggingWorks] = useState(false);
  const playingTrack = isPlaying ? activeTrack : null;
  const activeWork =
    typeof playingTrack === "number" ? works.find((work) => work.id === playingTrack) : null;

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

    if (rail.scrollLeft < loopDistance * 0.5) {
      rail.scrollLeft += loopDistance;
    } else if (rail.scrollLeft >= loopDistance * 1.5) {
      rail.scrollLeft -= loopDistance;
    }
  }, []);

  useEffect(() => {
    const rail = worksRailRef.current;
    const sequence = worksSequenceRef.current;
    if (!rail || !sequence) return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Touch / phone-like pointers only — avoid (hover: none) which some desktops trip.
    const coarseMq = window.matchMedia("(pointer: coarse)");
    // Must stay aligned with scroll-snap breakpoint in globals.css (max-width: 1023px).
    const narrowMq = window.matchMedia("(max-width: 1023px)");

    const canAutoScroll = () =>
      !reduceMq.matches && !coarseMq.matches && !narrowMq.matches;

    const placeInMiddleCopy = () => {
      const loopDistance = sequence.offsetWidth;
      if (loopDistance) rail.scrollLeft = loopDistance;
    };

    placeInMiddleCopy();

    // Only re-center when loop WIDTH changes (not height from image load).
    let lastLoopWidth = sequence.offsetWidth;
    const resizeObserver = new ResizeObserver(() => {
      const loopDistance = sequence.offsetWidth;
      if (!loopDistance || loopDistance === lastLoopWidth) return;
      lastLoopWidth = loopDistance;
      rail.scrollLeft = loopDistance;
    });

    let frame = 0;
    let previousTime = 0;
    let running = false;

    const isNearViewport = () => {
      const rect = rail.getBoundingClientRect();
      return rect.bottom > -240 && rect.top < window.innerHeight + 240;
    };

    const moveRail = (time: number) => {
      if (!running) {
        frame = 0;
        return;
      }
      frame = window.requestAnimationFrame(moveRail);

      if (!canAutoScroll()) {
        previousTime = 0;
        return;
      }

      // Fresh visibility each frame — never depend on a stale IO flag alone.
      const near = isNearViewport();
      worksRailPausedRef.current.visible = near;
      if (!near) {
        previousTime = 0;
        return;
      }

      const pauseState = worksRailPausedRef.current;
      if (pauseState.hover || pauseState.interaction || pauseState.focus) {
        previousTime = 0;
        return;
      }

      if (!previousTime) previousTime = time;
      const elapsed = Math.min(time - previousTime, 40);
      rail.scrollLeft += elapsed * 0.042;
      normalizeWorksRail();
      previousTime = time;
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      previousTime = 0;
      if (!frame) frame = window.requestAnimationFrame(moveRail);
    };

    const stopLoop = () => {
      running = false;
      previousTime = 0;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    // Clear sticky hover if DOM remounts while the pointer is over a cover.
    const clearHoverPause = () => {
      clipHoverCountRef.current = 0;
      worksRailPausedRef.current.hover = false;
    };

    resizeObserver.observe(sequence);
    rail.addEventListener("scroll", normalizeWorksRail, { passive: true });
    rail.addEventListener("pointerleave", clearHoverPause);
    worksRailPausedRef.current.visible = isNearViewport();
    startLoop();

    const onMq = () => {
      if (canAutoScroll()) startLoop();
      // Keep RAF alive; moveRail no-ops while gated.
    };
    reduceMq.addEventListener("change", onMq);
    coarseMq.addEventListener("change", onMq);
    narrowMq.addEventListener("change", onMq);

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      rail.removeEventListener("scroll", normalizeWorksRail);
      rail.removeEventListener("pointerleave", clearHoverPause);
      reduceMq.removeEventListener("change", onMq);
      coarseMq.removeEventListener("change", onMq);
      narrowMq.removeEventListener("change", onMq);
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

  async function toggleTrack(id: TrackId, clip: string) {
    const audio = audioRef.current;
    if (!audio) return;

    pauseCaseAudioRef.current?.();

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
        viewport={duplicate ? undefined : { once: true, amount: 0.2 }}
        aria-hidden={duplicate || undefined}
      >
        <div
          className="work__image"
          onMouseEnter={pauseRailForHover}
          onMouseLeave={resumeRailFromHover}
        >
          <Image
            src={work.image}
            alt={duplicate ? "" : `${work.label} 封面`}
            fill
            sizes="(max-width: 767px) 84vw, (max-width: 1023px) 42vw, 18vw"
          />
        </div>
        <div className="work__meta">
          <div>
            <span className="work__name fx-link">
              <span>{work.label}</span>
              {work.subtitle ? <span className="work__name-detail">{work.subtitle}</span> : null}
            </span>
            <span className="work__note">{work.type}</span>
            {work.roles?.length ? (
              <span className="work__roles">{work.roles.join(" / ")}</span>
            ) : null}
            {work.musicTags?.length ? (
              <span className="work__tags">{work.musicTags.join(" · ")}</span>
            ) : null}
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
              onFocus={() => {
                worksRailPausedRef.current.focus = true;
              }}
              onBlur={() => {
                worksRailPausedRef.current.focus = false;
              }}
            >
              <span className="clip-button__icon" aria-hidden>
                {isTrackPlaying ? "Ⅱ" : "▶"}
              </span>
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
        {audioMissing === work.id && !duplicate ? (
          <p className="clip-missing">试听暂时未加载，请刷新页面后再试。</p>
        ) : null}
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

      {/* ——— Hero ——— */}
      <motion.section
        className="works-hero"
        aria-labelledby="works-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <span className="works-hero__kicker">02 / 音乐生产系统</span>
        <h1 id="works-title" className="works-hero__title" aria-label="从 DAW 到模型">
          {reduceMotion ? (
            <span className="works-hero__title-text">从 DAW 到模型</span>
          ) : (
            <FuzzyText
              className="page-fuzzy page-fuzzy--works"
              fontSize={heroFuzzySize}
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
              从 DAW 到模型
            </FuzzyText>
          )}
        </h1>
        <p className="works-hero__en" aria-hidden>
          FROM DAW TO MODEL
        </p>
        <p className="works-hero__sub">独立制作 × AI 音乐工作流</p>
        <p className="works-hero__lead">
          我先用耳朵和 DAW 完成作品，
          <br />
          再把审美判断拆成标签、对比与迭代。
        </p>
      </motion.section>

      {/* ——— 01 Human-led + preserved rail ——— */}
      <section className="works-human section section--works" aria-labelledby="works-human-title">
        <header className="works-chapter-head works-chapter-head--human">
          <div className="works-chapter-head__row">
            <span className="works-chapter-head__index">01 / 独立制作</span>
            <span className="works-chapter-head__en" aria-hidden>
              HUMAN-LED
              <br />
              PRODUCTION
            </span>
          </div>
          <h2 id="works-human-title" className="works-chapter-head__title">
            完整主导一首作品的生成
          </h2>
          <p className="works-chapter-head__lead">
            从旋律、编曲到人声与混音，
            <br className="works-bridge__br" />
            完整主导一首作品的生成过程。
          </p>
        </header>

        <p className="works-tune-in" aria-hidden>
          TUNING IN
        </p>
        <div
          ref={worksRailRef}
          className={`works-rail ${isDraggingWorks ? "works-rail--dragging" : ""}`}
          aria-label="可左右拖动、无限循环展示六个音乐作品，鼠标移入封面或试听时暂停"
          onPointerDown={startWorksDrag}
          onPointerMove={moveWorksDrag}
          onPointerUp={finishWorksDrag}
          onPointerCancel={finishWorksDrag}
          onPointerLeave={() => {
            clipHoverCountRef.current = 0;
            worksRailPausedRef.current.hover = false;
            if (dragRef.current.active) {
              dragRef.current.active = false;
              worksRailPausedRef.current.interaction = false;
              setIsDraggingWorks(false);
            }
          }}
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
      </section>

      <SoundToSignalBridge />

      <AiLabSection
        onRegisterPause={(pause) => {
          pauseCaseAudioRef.current = pause;
        }}
        onPlayStart={() => {
          const audio = audioRef.current;
          if (audio && !audio.paused) {
            audio.pause();
            setIsPlaying(false);
          }
        }}
      />

      <MusicEvalSystem />
    </PortfolioShell>
  );
}
