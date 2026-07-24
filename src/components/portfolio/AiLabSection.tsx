"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { autoRenewalCase, type AiCaseHighlight } from "@/data/autoRenewalCase";

type AiLabSectionProps = {
  onRegisterPause?: (pause: (() => void) | null) => void;
  onPlayStart?: () => void;
};

type ActivePlayback = "full" | "post-chorus" | "verse-2" | null;

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function MiniWave({ active }: { active?: boolean }) {
  return (
    <svg
      className={`ai-case__mini-wave${active ? " is-active" : ""}`}
      viewBox="0 0 120 28"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 14 L6 10 L12 18 L18 8 L24 20 L30 11 L36 16 L42 7 L48 19 L54 12 L60 14 L66 9 L72 17 L78 11 L84 15 L90 10 L96 16 L102 12 L108 14 L114 13 L120 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AiLabSection({
  onRegisterPause,
  onPlayStart,
}: AiLabSectionProps) {
  const reduceMotion = useReducedMotion();
  const caseData = autoRenewalCase;
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsId = useId();
  const activePlaybackRef = useRef<ActivePlayback>(null);
  const fullResumeRef = useRef(0);
  const baseVolumeRef = useRef(1);
  const fadeRafRef = useRef<number | null>(null);
  const clipEndRef = useRef<number | null>(null);
  const clipFadeStartRef = useRef<number | null>(null);
  const fadingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayback, setActivePlayback] = useState<ActivePlayback>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [savedFullTime, setSavedFullTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  const rememberFullPosition = useCallback((sec: number) => {
    fullResumeRef.current = sec;
    setSavedFullTime(sec);
  }, []);

  const cancelFade = useCallback(() => {
    if (fadeRafRef.current != null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
    fadingRef.current = false;
  }, []);

  const restoreVolume = useCallback(() => {
    cancelFade();
    const audio = audioRef.current;
    if (audio) audio.volume = baseVolumeRef.current;
  }, [cancelFade]);

  const clearClipMode = useCallback(() => {
    clipEndRef.current = null;
    clipFadeStartRef.current = null;
    fadingRef.current = false;
    cancelFade();
  }, [cancelFade]);

  const finishClipNatural = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelFade();
    audio.pause();
    audio.volume = baseVolumeRef.current;
    audio.currentTime = fullResumeRef.current;
    setCurrentTime(fullResumeRef.current);
    clearClipMode();
    activePlaybackRef.current = null;
    setActivePlayback(null);
    setIsPlaying(false);
  }, [cancelFade, clearClipMode]);

  const pauseAll = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelFade();
    audio.pause();
    audio.volume = baseVolumeRef.current;
    clearClipMode();
    setIsPlaying(false);
  }, [cancelFade, clearClipMode]);

  useEffect(() => {
    onRegisterPause?.(() => {
      pauseAll();
      activePlaybackRef.current = null;
      setActivePlayback(null);
    });
    return () => onRegisterPause?.(null);
  }, [onRegisterPause, pauseAll]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    baseVolumeRef.current = audio.volume || 1;

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const runClipFrame = () => {
      const end = clipEndRef.current;
      const fadeStart = clipFadeStartRef.current;
      if (end == null || audio.paused) {
        fadeRafRef.current = null;
        return;
      }

      setCurrentTime(audio.currentTime);

      if (
        fadeStart != null &&
        !fadingRef.current &&
        audio.currentTime >= fadeStart
      ) {
        fadingRef.current = true;
        const startVol = baseVolumeRef.current;
        const startAt = performance.now();
        const durationMs = Math.max(80, (end - Math.min(audio.currentTime, end)) * 1000);
        const tickFade = (now: number) => {
          if (!fadingRef.current) {
            fadeRafRef.current = null;
            return;
          }
          const t = Math.min(1, (now - startAt) / durationMs);
          audio.volume = Math.max(0, startVol * (1 - t));
          if (t < 1 && audio.currentTime < end) {
            fadeRafRef.current = requestAnimationFrame(tickFade);
            return;
          }
          fadeRafRef.current = null;
          finishClipNatural();
        };
        fadeRafRef.current = requestAnimationFrame(tickFade);
        return;
      }

      if (!fadingRef.current && audio.currentTime >= end) {
        finishClipNatural();
        return;
      }

      fadeRafRef.current = requestAnimationFrame(runClipFrame);
    };

    const ensureClipLoop = () => {
      if (clipEndRef.current == null || audio.paused || fadingRef.current) return;
      if (fadeRafRef.current == null) {
        fadeRafRef.current = requestAnimationFrame(runClipFrame);
      }
    };

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      ensureClipLoop();
    };

    const onPlay = () => {
      ensureClipLoop();
    };

    const onEnded = () => {
      restoreVolume();
      clearClipMode();
      activePlaybackRef.current = null;
      setActivePlayback(null);
      setIsPlaying(false);
      setCurrentTime(0);
      rememberFullPosition(0);
      audio.currentTime = 0;
    };

    syncDuration();
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("ended", onEnded);
    return () => {
      cancelFade();
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("ended", onEnded);
    };
  }, [cancelFade, clearClipMode, finishClipNatural, rememberFullPosition, restoreVolume]);

  async function toggleFullPlay() {
    const audio = audioRef.current;
    if (!audio) return;

    const mode = activePlaybackRef.current;
    if (mode === "full" && !audio.paused) {
      audio.pause();
      rememberFullPosition(audio.currentTime);
      setIsPlaying(false);
      return;
    }

    // Leaving a clip for full playback restores the saved full position.
    if (mode === "post-chorus" || mode === "verse-2") {
      restoreVolume();
      clearClipMode();
      audio.currentTime = fullResumeRef.current;
      setCurrentTime(fullResumeRef.current);
    }

    activePlaybackRef.current = "full";
    setActivePlayback("full");
    onPlayStart?.();
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      activePlaybackRef.current = null;
      setActivePlayback(null);
    }
  }

  function onSeek(event: ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const next = Number(event.target.value);
    if (activePlaybackRef.current === "post-chorus" || activePlaybackRef.current === "verse-2") {
      restoreVolume();
      clearClipMode();
      activePlaybackRef.current = isPlaying ? "full" : null;
      setActivePlayback(isPlaying ? "full" : null);
    }
    audio.currentTime = next;
    setCurrentTime(next);
    rememberFullPosition(next);
  }

  async function toggleHighlight(item: AiCaseHighlight) {
    const audio = audioRef.current;
    if (!audio) return;
    const clipId = item.id;

    // Pause current same clip (keep in-clip position for resume).
    if (activePlaybackRef.current === clipId && !audio.paused) {
      cancelFade();
      audio.pause();
      audio.volume = baseVolumeRef.current;
      fadingRef.current = false;
      setIsPlaying(false);
      return;
    }

    // Resume same clip from pause
    if (activePlaybackRef.current === clipId && audio.paused) {
      clipEndRef.current = item.endSec;
      clipFadeStartRef.current = item.fadeStartSec;
      fadingRef.current = false;
      restoreVolume();
      onPlayStart?.();
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    // Entering clip from full / idle / other clip: preserve full resume once.
    if (activePlaybackRef.current === null || activePlaybackRef.current === "full") {
      rememberFullPosition(audio.currentTime);
    }

    restoreVolume();
    clearClipMode();
    clipEndRef.current = item.endSec;
    clipFadeStartRef.current = item.fadeStartSec;
    activePlaybackRef.current = clipId;
    setActivePlayback(clipId);
    onPlayStart?.();
    try {
      audio.currentTime = item.startSec;
      setCurrentTime(item.startSec);
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      activePlaybackRef.current = null;
      setActivePlayback(null);
      clearClipMode();
    }
  }

  const clipMode =
    activePlayback === "post-chorus" || activePlayback === "verse-2";
  const uiTime = clipMode ? savedFullTime : currentTime;
  const progress = duration > 0 ? Math.min(1, uiTime / duration) : 0;
  const fullPlaying = activePlayback === "full" && isPlaying;
  const displayDuration = caseData.displayDuration;

  return (
    <section className="works-ai" aria-labelledby="works-ai-title">
      <header className="works-chapter-head works-chapter-head--ai">
        <div className="works-chapter-head__inner">
          <div className="works-chapter-head__copy">
            <span className="works-chapter-head__index">02 / AI 协作实验</span>
            <h2 id="works-ai-title" className="works-chapter-head__title">
              生成设定与听感筛选
            </h2>
            <p className="works-chapter-head__lead">
              把创意方向、声音要求与版本判断，
              <br />
              转译成可执行的生成输入，
              <br />
              再从多轮结果中筛出最贴近目标的一版。
            </p>
          </div>
          <div className="works-chapter-head__en" aria-hidden>
            PROMPT &
            <br />
            LISTENING LAB
          </div>
        </div>
      </header>

      {/* Keep case study statically visible: tall article + whileInView amount never resolved → opacity 0 blank screens */}
      <article className="ai-case">
        <audio ref={audioRef} src={caseData.audio} preload="metadata" />

        <header className="ai-case__hero">
          <p className="ai-case__kicker">
            <span>{caseData.caseLabel}</span>
            <span className="ai-case__kicker-en" aria-hidden>
              {caseData.caseLabelEn}
            </span>
          </p>
          <div className="ai-case__hero-grid">
            <div className="ai-case__cover">
              <Image
                src={caseData.cover}
                alt={caseData.coverAlt}
                fill
                sizes="(max-width: 767px) 86vw, (max-width: 1023px) 42vw, 320px"
                className="ai-case__cover-img"
              />
            </div>
            <div className="ai-case__hero-copy">
              <h3 className="ai-case__title">{caseData.title}</h3>
              <p className="ai-case__en" aria-hidden>
                {caseData.englishTitle}
              </p>
              <p className="ai-case__one-liner">
                {caseData.oneLiner.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <dl className="ai-case__meta">
                {caseData.meta.map((item) => (
                  <div key={item.label}>
                    <dt>
                      <span className="ai-case__meta-cn">{item.label}</span>
                      <span className="ai-case__meta-en" aria-hidden>
                        {item.en}
                      </span>
                    </dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </header>

        <div className="ai-case__roles">
          <div>
            <p className="ai-case__roles-label">
              <span className="ai-case__roles-cn">{caseData.rolesTitle}</span>
              <span className="ai-case__roles-en" aria-hidden>
                {caseData.rolesTitleEn}
              </span>
            </p>
            <ul>
              {caseData.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ai-case__roles-label">
              <span className="ai-case__roles-cn">{caseData.collaborationTitle}</span>
              <span className="ai-case__roles-en" aria-hidden>
                {caseData.collaborationTitleEn}
              </span>
            </p>
            <ul>
              {caseData.collaboration.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="ai-case__roles-notes">
            <p>
              {caseData.collaborationNotes[0]}
              <br />
              {caseData.collaborationNotes[1]}
            </p>
            <p>
              {caseData.generationNotes[0]}
              <br />
              {caseData.generationNotes[1]}
            </p>
          </div>
        </div>

        <section className="ai-case__block" aria-labelledby="ai-case-context">
          <header className="ai-case__block-head">
            <h4 id="ai-case-context">{caseData.context.title}</h4>
            <span aria-hidden>{caseData.context.en}</span>
          </header>
          {caseData.context.paragraphs.map((p) => (
            <p key={p} className="ai-case__prose">
              {p}
            </p>
          ))}
          <p className="ai-case__metaphor">{caseData.context.metaphor}</p>
          <div className="ai-case__selected-lyrics">
            <header className="ai-case__selected-lyrics-head">
              <h4>精选歌词</h4>
              <span aria-hidden>SELECTED LYRICS</span>
            </header>
            <div className="ai-case__lyrics-pair">
              <figure className="ai-case__lyric-fig">
                <figcaption>01 / CONCEPT</figcaption>
                {caseData.context.conceptLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </figure>
              <span className="ai-case__lyrics-rule" aria-hidden />
              <figure className="ai-case__lyric-fig">
                <figcaption>02 / SCENE</figcaption>
                {caseData.context.sceneLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </figure>
            </div>
          </div>
        </section>

        <section className="ai-case__block ai-case__block--brief" aria-labelledby="ai-case-brief">
          <header className="ai-case__block-head ai-case__block-head--brief">
            <div className="ai-case__block-head-main">
              <h4 id="ai-case-brief">{caseData.brief.title}</h4>
              <span className="ai-case__block-en" aria-hidden>
                {caseData.brief.en}
              </span>
            </div>
          </header>
          <p className="ai-case__brief-subtitle">{caseData.brief.subtitle}</p>
          <p className="ai-case__brief-intro">
            {caseData.brief.intro[0]}
            <br />
            {caseData.brief.intro[1]}
          </p>
          <p className="ai-case__reconstructed">
            <strong>{caseData.brief.reconstructedLabel}</strong>
            <span>{caseData.brief.reconstructedNote}</span>
          </p>
          {caseData.brief.body.map((p) => (
            <p key={p} className="ai-case__prose">
              {p}
            </p>
          ))}
          <div className="ai-case__sonic">
            <header className="ai-case__sonic-intro">
              <div className="ai-case__sonic-intro-titles">
                <h5 className="ai-case__sonic-title">{caseData.brief.sonic.title}</h5>
                <span className="ai-case__sonic-title-en" aria-hidden>
                  {caseData.brief.sonic.titleEn}
                </span>
              </div>
              <p className="ai-case__sonic-lead">
                {caseData.brief.sonic.lead[0]}
                <br />
                {caseData.brief.sonic.lead[1]}
              </p>
            </header>

            <div className="ai-case__sonic-grid" aria-label="声音配方">
              <span className="ai-case__sonic-signal" aria-hidden="true" />

              <article className="ai-case__sonic-mod ai-case__sonic-style">
                <header className="ai-case__sonic-mod-head">
                  <span className="ai-case__sonic-mod-cn">{caseData.brief.sonic.style.title}</span>
                  <span className="ai-case__sonic-mod-en" aria-hidden>
                    {caseData.brief.sonic.style.titleEn}
                  </span>
                </header>
                <ul className="ai-case__sonic-styles">
                  {caseData.brief.sonic.style.lines.map((line, index) => (
                    <li
                      key={line.text}
                      className={`ai-case__sonic-style-line is-${line.weight}`}
                      style={reduceMotion ? undefined : { ["--i" as string]: index }}
                    >
                      {line.text}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="ai-case__sonic-mod ai-case__sonic-tempo">
                <header className="ai-case__sonic-mod-head">
                  <span className="ai-case__sonic-mod-cn">{caseData.brief.sonic.tempo.title}</span>
                  <span className="ai-case__sonic-mod-en" aria-hidden>
                    {caseData.brief.sonic.tempo.titleEn}
                  </span>
                </header>
                <div className="ai-case__sonic-bpm">
                  <span className="ai-case__sonic-bpm-num">{caseData.brief.sonic.tempo.bpm}</span>
                  <span className="ai-case__sonic-bpm-unit">{caseData.brief.sonic.tempo.unit}</span>
                </div>
                <p className="ai-case__sonic-bpm-feel">{caseData.brief.sonic.tempo.feel}</p>
                <p className="ai-case__sonic-bpm-range">{caseData.brief.sonic.tempo.rangeNote}</p>
              </article>

              <article className="ai-case__sonic-mod ai-case__sonic-vocal">
                <header className="ai-case__sonic-mod-head">
                  <span className="ai-case__sonic-mod-cn">{caseData.brief.sonic.vocal.title}</span>
                  <span className="ai-case__sonic-mod-en" aria-hidden>
                    {caseData.brief.sonic.vocal.titleEn}
                  </span>
                </header>
                <div className="ai-case__sonic-vocal-cols">
                  <div className="ai-case__sonic-vocal-col">
                    <p className="ai-case__sonic-vocal-label">
                      <span>{caseData.brief.sonic.vocal.desiredLabel}</span>
                      <span aria-hidden>{caseData.brief.sonic.vocal.desiredLabelEn}</span>
                    </p>
                    <ul>
                      {caseData.brief.sonic.vocal.desired.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="ai-case__sonic-vocal-col ai-case__sonic-vocal-col--avoid">
                    <p className="ai-case__sonic-vocal-label">
                      <span>{caseData.brief.sonic.vocal.avoidLabel}</span>
                      <span aria-hidden>{caseData.brief.sonic.vocal.avoidLabelEn}</span>
                    </p>
                    <ul>
                      {caseData.brief.sonic.vocal.avoid.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>

              <div className="ai-case__sonic-tracks">
                {caseData.brief.sonic.tracks.map((track) => (
                  <article
                    key={track.id}
                    className={`ai-case__sonic-mod ai-case__sonic-track ai-case__sonic-track--${track.id}`}
                  >
                    <header className="ai-case__sonic-mod-head">
                      <span className="ai-case__sonic-mod-cn">{track.title}</span>
                      <span className="ai-case__sonic-mod-en" aria-hidden>
                        {track.titleEn}
                      </span>
                    </header>
                    <ol className="ai-case__sonic-lane" aria-label={track.title}>
                      {track.nodes.map((node, index) => (
                        <li key={node} style={reduceMotion ? undefined : { ["--i" as string]: index }}>
                          <span className="ai-case__sonic-lane-node" aria-hidden />
                          <span className="ai-case__sonic-lane-text">{node}</span>
                          {index < track.nodes.length - 1 ? (
                            <span className="ai-case__sonic-lane-rule" aria-hidden />
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="ai-case__block" aria-labelledby="ai-case-selection">
          <header className="ai-case__block-head">
            <h4 id="ai-case-selection">{caseData.selection.title}</h4>
            <span aria-hidden>{caseData.selection.en}</span>
          </header>
          {caseData.selection.summary.map((p) => (
            <p key={p} className="ai-case__prose">
              {p}
            </p>
          ))}
          <ol className="ai-case__version-rail" aria-label="六次生成轮次">
            {caseData.selection.versions.map((version, index) => {
              const selected = version === caseData.selection.selectedVersion;
              return (
                <li
                  key={version}
                  className={`ai-case__version-node${selected ? " is-selected" : ""}`}
                  style={reduceMotion ? undefined : { animationDelay: `${index * 0.06}s` }}
                >
                  <span>{selected ? `${version} / SELECTED` : version}</span>
                </li>
              );
            })}
          </ol>
          <div className="ai-case__selection-grid">
            <div>
              <p className="ai-case__sublabel">DIRECTION VARIATIONS</p>
              <ul className="ai-case__chip-list">
                {caseData.selection.directionVariations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="ai-case__sublabel">COMMON REJECTION REASONS</p>
              <ul className="ai-case__reject-list">
                {caseData.selection.rejectionReasons.map((item) => (
                  <li key={item.index}>
                    <span>{item.index}</span>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="ai-case__final-pick">
            <p className="ai-case__sublabel">FINAL SELECTION</p>
            {caseData.selection.finalSelection.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className="ai-case__block" aria-labelledby="ai-case-final">
          <header className="ai-case__block-head">
            <h4 id="ai-case-final">{caseData.finalOutput.title}</h4>
            <span aria-hidden>{caseData.finalOutput.en}</span>
          </header>
          <div className="ai-case__player">
            <div className="ai-case__player-copy">
              <p className="ai-case__player-title">{caseData.title}</p>
              <p className="ai-case__player-sub">{caseData.finalOutput.playerLabel}</p>
            </div>
            <button
              type="button"
              className={`ai-case__play${fullPlaying ? " is-playing" : ""}`}
              aria-label={fullPlaying ? `暂停 ${caseData.title}` : `播放 ${caseData.title}`}
              onClick={() => void toggleFullPlay()}
            >
              <span aria-hidden>{fullPlaying ? "Ⅱ" : "▶"}</span>
              <span>{fullPlaying ? "暂停" : "播放"}</span>
            </button>
            <div className="ai-case__player-time">
              <span>
                {formatTime(uiTime)} / {displayDuration}
              </span>
            </div>
            <label className="ai-case__seek">
              <span className="ai-case__sr">进度</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(uiTime, duration || 0)}
                disabled={!duration}
                onChange={onSeek}
                aria-valuemin={0}
                aria-valuemax={duration || 0}
                aria-valuenow={uiTime}
                aria-valuetext={`${formatTime(uiTime)} / ${displayDuration}`}
              />
              <span
                className="ai-case__seek-fill"
                style={{ ["--seek" as string]: progress }}
                aria-hidden
              />
            </label>
          </div>
        </section>

        <section className="ai-case__block" aria-labelledby="ai-case-highlights">
          <header className="ai-case__block-head">
            <h4 id="ai-case-highlights">05 / 试听重点</h4>
            <span aria-hidden>LISTENING HIGHLIGHTS</span>
          </header>
          <div className="ai-case__highlights">
            {caseData.highlights.map((item) => {
              const active = activePlayback === item.id && isPlaying;
              return (
                <article key={item.id} className={`ai-case__highlight${active ? " is-active" : ""}`}>
                  <div className="ai-case__highlight-top">
                    <span className="ai-case__highlight-label">{item.label}</span>
                    <span className="ai-case__highlight-en" aria-hidden>
                      {item.en}
                    </span>
                    <span className="ai-case__highlight-time">{item.timeLabel}</span>
                  </div>
                  <MiniWave active={active} />
                  <p className="ai-case__highlight-lyric">{item.lyric}</p>
                  <p className="ai-case__highlight-note">{item.note}</p>
                  <button
                    type="button"
                    className={`ai-case__highlight-btn${active ? " is-playing" : ""}`}
                    onClick={() => void toggleHighlight(item)}
                    aria-label={`${active ? "暂停" : "播放"} ${item.label} ${item.timeLabel}`}
                  >
                    {active ? "暂停片段" : "播放片段"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="ai-case__block" aria-labelledby="ai-case-eval">
          <header className="ai-case__block-head">
            <h4 id="ai-case-eval">{caseData.evaluation.title}</h4>
            <span aria-hidden>{caseData.evaluation.en}</span>
          </header>
          <ul className="ai-case__eval-rows">
            {caseData.evaluation.rows.map((row) => (
              <li key={row.id}>
                <span>{row.dimension}</span>
                <span>{row.level}</span>
              </li>
            ))}
          </ul>
          <div className="ai-case__eval-copy">
            <div>
              <p className="ai-case__sublabel">成立的部分</p>
              {caseData.evaluation.strengths.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div>
              <p className="ai-case__sublabel">仍可改善</p>
              {caseData.evaluation.improvements.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <div className="ai-case__lyrics">
          <button
            type="button"
            className="ai-case__lyrics-toggle"
            aria-expanded={lyricsOpen}
            aria-controls={lyricsId}
            onClick={() => setLyricsOpen((v) => !v)}
          >
            {lyricsOpen ? "HIDE FULL LYRICS −" : "VIEW FULL LYRICS ＋"}
          </button>
          <div
            id={lyricsId}
            className={`ai-case__lyrics-panel${lyricsOpen ? " is-open" : ""}`}
            hidden={!lyricsOpen}
          >
            <p className="ai-case__lyrics-note">{caseData.lyricsNote}</p>
            {caseData.lyrics.map((block, index) => (
              <div key={`${block.section}-${index}`} className="ai-case__lyrics-block">
                <div className="ai-case__lyrics-block-head">
                  <span>[{block.section}]</span>
                  <span>{block.sourceLabel}</span>
                </div>
                {block.lines.map((line, lineIndex) =>
                  line ? <p key={`${index}-${lineIndex}`}>{line}</p> : <br key={`${index}-${lineIndex}`} />,
                )}
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
