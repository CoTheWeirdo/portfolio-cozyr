"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./process-page.module.css";
import {
  claimProcessAudioPlayback,
  getClaimedProcessAudio,
  PROCESS_AUDIO_PLAY_EVENT,
} from "./processAudioEvents";

const AUDIO_SRC = "/audio/auto-renewal/final.m4a";
const COVER = "/assets/works/auto-renewal/cover.png";
const FULL_DURATION_LABEL = "02:29";
const FULL_DURATION_FALLBACK = 149;

/**
 * Historical clip ranges from autoRenewalCase.highlights
 * (post-chorus / verse-2) — not guessed.
 */
const SLICES = [
  {
    id: "slice-01" as const,
    label: "SLICE 01",
    startSec: 58,
    endSec: 70,
    fadeStartSec: 69,
    src: "/audio/auto-renewal/selected-slice-01.mp3",
    rangeLabel: "00:58—01:10",
    durationLabel: "00:12",
    lyrics: [
      "又一天",
      "又一天",
      "还没准备好就又一天",
      "又一天",
      "又一天",
      "我的人生自动续费",
    ],
    lyricTimings: [
      [[0, 0.08], [0.08, 0.22], [0.22, 0.52]],
      [[0.84, 0.96], [0.96, 1.1], [1.1, 1.36]],
      [
        [1.6, 1.74],
        [1.74, 2],
        [2, 2.22],
        [2.22, 2.42],
        [2.42, 2.68],
        [2.68, 2.86],
        [2.86, 3.12],
        [3.12, 3.58],
        [3.58, 4.9],
      ],
      [[6.86, 7.06], [7.06, 7.26], [7.26, 7.58]],
      [[7.74, 7.9], [7.9, 8.14], [8.14, 8.42]],
      [
        [8.66, 8.81],
        [8.81, 8.96],
        [8.96, 9.3],
        [9.3, 9.68],
        [9.68, 10.18],
        [10.18, 10.52],
        [10.52, 10.8],
        [10.8, 11.4],
      ],
    ],
    wave: [36, 52, 44, 68, 40, 74, 48, 62, 38, 70, 46, 58, 42, 66, 50, 72, 44, 60],
  },
  {
    id: "slice-02" as const,
    label: "SLICE 02",
    startSec: 70,
    endSec: 79,
    fadeStartSec: 78,
    src: "/audio/auto-renewal/selected-slice-02.mp3",
    rangeLabel: "01:10—01:19",
    durationLabel: "00:09",
    lyrics: [
      "午餐照片看起来不错",
      "其实味道也就差不多",
      "群聊里都在庆祝生活",
      "我打了个笑脸跟着附和",
    ],
    lyricTimings: [
      [
        [0.9, 1.38],
        [1.38, 1.54],
        [1.54, 1.84],
        [1.84, 2],
        [2, 2.3],
        [2.3, 2.5],
        [2.5, 2.72],
        [2.72, 2.94],
        [2.94, 3.24],
      ],
      [
        [3.5, 3.58],
        [3.58, 3.66],
        [3.66, 3.8],
        [3.8, 3.9],
        [3.9, 4.08],
        [4.08, 4.24],
        [4.24, 4.46],
        [4.46, 4.68],
        [4.68, 4.9],
      ],
      [
        [5.26, 5.38],
        [5.38, 5.44],
        [5.44, 5.58],
        [5.58, 5.82],
        [5.82, 6.02],
        [6.02, 6.26],
        [6.26, 6.42],
        [6.42, 6.64],
        [6.64, 6.86],
      ],
      [
        [7.06, 7.18],
        [7.18, 7.24],
        [7.24, 7.3],
        [7.3, 7.38],
        [7.38, 7.56],
        [7.56, 7.78],
        [7.78, 7.98],
        [7.98, 8.2],
        [8.2, 8.44],
        [8.44, 8.68],
      ],
    ],
    wave: [42, 58, 50, 66, 44, 72, 48, 60, 40, 68, 52, 56, 46, 70, 54, 62],
  },
] as const;

const ALIGNED_LAYERS = [
  { en: "TEXTURE", cn: "质感" },
  { en: "VOICE", cn: "人声" },
  { en: "RHYTHM", cn: "节奏" },
  { en: "LYRICS", cn: "歌词" },
  { en: "EMOTION", cn: "情绪" },
] as const;

type Mode = "slice-01" | "slice-02" | "full" | null;

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function formatTime(sec: number) {
  const safe = Number.isFinite(sec) ? Math.max(0, sec) : 0;
  return `${pad2(Math.floor(safe / 60))}:${pad2(safe % 60)}`;
}

function KaraokeLyrics({
  lines,
  timings,
  elapsed,
  active,
}: {
  lines: readonly string[];
  timings: readonly (readonly (readonly [number, number])[])[];
  elapsed: number;
  active: boolean;
}) {
  return (
    <>
      {lines.map((line, lineIndex) => {
        const chars = Array.from(line);
        const charTimings = timings[lineIndex] ?? [];

        return (
          <p
            key={`${lineIndex}-${line}`}
            className={
              lineIndex === lines.length - 1
                ? styles.timelineLyricLast
                : undefined
            }
            aria-label={line}
          >
            {chars.map((char, charIndex) => {
              const [start, end] = charTimings[charIndex] ?? [0, 1];
              const charProgress = active
                ? Math.min(
                    1,
                    Math.max(0, (elapsed - start) / Math.max(0.04, end - start)),
                  )
                : 0;
              const karaokeStyle = {
                "--karaoke-progress": `${charProgress * 100}%`,
              } as CSSProperties;

              return (
                <span
                  key={`${charIndex}-${char}`}
                  className={styles.karaokeGlyph}
                  style={karaokeStyle}
                  aria-hidden="true"
                >
                  <span className={styles.karaokeLyricText}>{char}</span>
                  <span className={styles.karaokeLyricGlow}>{char}</span>
                </span>
              );
            })}
          </p>
        );
      })}
    </>
  );
}

export default function ProcessAudioExperience() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioByModeRef = useRef<
    Record<Exclude<Mode, null>, HTMLAudioElement> | null
  >(null);
  const rafRef = useRef<number | null>(null);
  const modeRef = useRef<Mode>(null);
  const fadingRef = useRef(false);
  const seekingRef = useRef(false);

  const [mode, setMode] = useState<Mode>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [sliceElapsed, setSliceElapsed] = useState(0);
  const [fullTime, setFullTime] = useState(0);
  const [fullDuration, setFullDuration] = useState(FULL_DURATION_FALLBACK);
  const [selectedSliceId, setSelectedSliceId] =
    useState<(typeof SLICES)[number]["id"]>("slice-01");

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const restoreVolume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    fadingRef.current = false;
    if (!audio.muted) audio.volume = 1;
  }, []);

  const finishSlice = useCallback(() => {
    const audio = audioRef.current;
    stopRaf();
    fadingRef.current = false;
    if (audio) {
      audio.pause();
      audio.volume = audio.muted ? 0 : 1;
    }
    modeRef.current = null;
    setMode(null);
    setPlaying(false);
    setSliceElapsed(0);
  }, [stopRaf]);

  const tick = useCallback(function runTick() {
    const audio = audioRef.current;
    const currentMode = modeRef.current;
    if (!audio || !currentMode || audio.paused) {
      rafRef.current = null;
      return;
    }

    if (currentMode === "full") {
      if (!seekingRef.current) {
        setFullTime(audio.currentTime);
      }
      rafRef.current = requestAnimationFrame(runTick);
      return;
    }

    const slice = SLICES.find((item) => item.id === currentMode);
    if (!slice) {
      rafRef.current = null;
      return;
    }

    const elapsed = Math.max(0, audio.currentTime);
    const clipLen = slice.endSec - slice.startSec;
    const fadeAt = clipLen - (slice.endSec - slice.fadeStartSec);
    setSliceElapsed(Math.min(clipLen, elapsed));

    if (!fadingRef.current && audio.currentTime >= fadeAt) {
      fadingRef.current = true;
      const startVol = audio.muted ? 0 : 1;
      const startAt = performance.now();
      const durationMs = Math.max(
        80,
        (clipLen - Math.min(audio.currentTime, clipLen)) * 1000,
      );

      const tickFade = (now: number) => {
        if (!fadingRef.current || modeRef.current !== currentMode) {
          rafRef.current = null;
          return;
        }
        const t = Math.min(1, (now - startAt) / durationMs);
        if (!audio.muted) audio.volume = Math.max(0, startVol * (1 - t));
        setSliceElapsed(
          Math.min(clipLen, Math.max(0, audio.currentTime)),
        );
        if (t < 1 && audio.currentTime < clipLen) {
          rafRef.current = requestAnimationFrame(tickFade);
          return;
        }
        finishSlice();
      };

      rafRef.current = requestAnimationFrame(tickFade);
      return;
    }

    if (!fadingRef.current && audio.currentTime >= clipLen) {
      finishSlice();
      return;
    }

    rafRef.current = requestAnimationFrame(runTick);
  }, [finishSlice]);

  const ensureLoop = useCallback(() => {
    if (rafRef.current == null && modeRef.current && audioRef.current && !audioRef.current.paused) {
      rafRef.current = requestAnimationFrame(() => tick());
    }
  }, [tick]);

  useEffect(() => {
    const audios: Record<Exclude<Mode, null>, HTMLAudioElement> = {
      "slice-01": new Audio(SLICES[0].src),
      "slice-02": new Audio(SLICES[1].src),
      full: new Audio(AUDIO_SRC),
    };
    const allAudios = Object.values(audios);
    audioByModeRef.current = audios;
    audioRef.current = audios.full;

    const onMeta = () => {
      if (
        Number.isFinite(audios.full.duration) &&
        audios.full.duration > 0
      ) {
        setFullDuration(audios.full.duration);
      }
    };
    const onEnded = () => {
      const activeAudio = audioRef.current;
      stopRaf();
      restoreVolume();
      modeRef.current = null;
      setMode(null);
      setPlaying(false);
      setFullTime(0);
      setSliceElapsed(0);
      if (activeAudio) activeAudio.currentTime = 0;
    };
    const stopForAnotherAudio = (event: Event) => {
      if (allAudios.includes(getClaimedProcessAudio(event))) return;

      stopRaf();
      fadingRef.current = false;
      allAudios.forEach((audio) => {
        audio.pause();
        audio.volume = audio.muted ? 0 : 1;
      });
      if (modeRef.current === "full") {
        setFullTime(audios.full.currentTime);
      }
      modeRef.current = null;
      setMode(null);
      setPlaying(false);
      setSliceElapsed(0);
    };

    allAudios.forEach((audio) => {
      audio.preload = "auto";
      audio.addEventListener("ended", onEnded);
      audio.load();
    });
    audios.full.addEventListener("loadedmetadata", onMeta);
    audios.full.addEventListener("durationchange", onMeta);
    window.addEventListener(PROCESS_AUDIO_PLAY_EVENT, stopForAnotherAudio);

    return () => {
      stopRaf();
      audios.full.removeEventListener("loadedmetadata", onMeta);
      audios.full.removeEventListener("durationchange", onMeta);
      window.removeEventListener(PROCESS_AUDIO_PLAY_EVENT, stopForAnotherAudio);
      allAudios.forEach((audio) => {
        audio.pause();
        audio.removeEventListener("ended", onEnded);
        audio.removeAttribute("src");
        audio.load();
      });
      audioByModeRef.current = null;
      audioRef.current = null;
    };
  }, [restoreVolume, stopRaf]);

  useEffect(() => {
    const audios = audioByModeRef.current;
    if (!audios) return;
    Object.values(audios).forEach((audio) => {
      audio.muted = muted;
      if (!muted && !fadingRef.current) audio.volume = 1;
    });
  }, [muted]);

  async function startMode(next: Exclude<Mode, null>, atSec: number) {
    const audios = audioByModeRef.current;
    const audio = audios?.[next];
    if (!audio) return;
    const previousAudio = audioRef.current;
    const playbackAt = next === "full" ? atSec : 0;

    stopRaf();
    fadingRef.current = false;
    previousAudio?.pause();
    audioRef.current = audio;
    audio.volume = muted ? 0 : 1;
    modeRef.current = next;
    setMode(next);
    setSliceElapsed(0);
    if (next === "full") setFullTime(atSec);

    const seek = () => {
      audio.currentTime = playbackAt;
    };
    const waitingForMetadata = audio.readyState < 1;
    const metadataReady = waitingForMetadata
      ? new Promise<void>((resolve) => {
        const onReady = () => {
          audio.removeEventListener("loadedmetadata", onReady);
          resolve();
        };
        audio.addEventListener("loadedmetadata", onReady);
      })
      : Promise.resolve();

    if (!waitingForMetadata) seek();
    claimProcessAudioPlayback(audio);
    const playbackStarted = audio.play().then(
      () => true,
      () => false,
    );

    await metadataReady;
    seek();

    if (await playbackStarted) {
      setPlaying(true);
      ensureLoop();
    } else {
      setPlaying(false);
      modeRef.current = null;
      setMode(null);
    }
  }

  async function toggleSlice(sliceId: "slice-01" | "slice-02") {
    const audio = audioRef.current;
    const slice = SLICES.find((item) => item.id === sliceId);
    if (!audio || !slice) return;

    setSelectedSliceId(sliceId);

    if (modeRef.current === sliceId && playing) {
      audio.pause();
      stopRaf();
      fadingRef.current = false;
      audio.volume = muted ? 0 : 1;
      setPlaying(false);
      return;
    }

    if (modeRef.current === sliceId && !playing) {
      try {
        claimProcessAudioPlayback(audio);
        await audio.play();
        setPlaying(true);
        ensureLoop();
      } catch {
        setPlaying(false);
      }
      return;
    }

    await startMode(sliceId, slice.startSec);
  }

  function selectSlice(sliceId: "slice-01" | "slice-02") {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.volume = muted ? 0 : 1;
    }
    stopRaf();
    fadingRef.current = false;
    modeRef.current = null;
    setMode(null);
    setPlaying(false);
    setSliceElapsed(0);
    setSelectedSliceId(sliceId);
  }

  async function toggleFull() {
    const audio = audioRef.current;
    if (!audio) return;

    if (modeRef.current === "full" && playing) {
      audio.pause();
      stopRaf();
      setPlaying(false);
      setFullTime(audio.currentTime);
      return;
    }

    if (modeRef.current === "full" && !playing) {
      try {
        claimProcessAudioPlayback(audio);
        await audio.play();
        setPlaying(true);
        ensureLoop();
      } catch {
        setPlaying(false);
      }
      return;
    }

    await startMode("full", 0);
  }

  function seekFull(ratio: number) {
    const audio = audioByModeRef.current?.full;
    if (!audio) return;
    const duration =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : fullDuration;
    const next = Math.min(duration, Math.max(0, ratio * duration));
    if (modeRef.current !== "full") {
      audioRef.current?.pause();
      audioRef.current = audio;
      stopRaf();
      fadingRef.current = false;
      modeRef.current = "full";
      setMode("full");
      setSliceElapsed(0);
      restoreVolume();
      setPlaying(false);
    }
    audio.currentTime = next;
    setFullTime(next);
  }

  function onSeekPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    track.setPointerCapture(event.pointerId);
    seekingRef.current = true;
    const rect = track.getBoundingClientRect();
    const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    seekFull(ratio);

    const onMove = (moveEvent: PointerEvent) => {
      const moveRect = track.getBoundingClientRect();
      const moveRatio =
        moveRect.width > 0
          ? (moveEvent.clientX - moveRect.left) / moveRect.width
          : 0;
      seekFull(moveRatio);
    };
    const onUp = () => {
      seekingRef.current = false;
      track.releasePointerCapture(event.pointerId);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      if (modeRef.current === "full" && playing) ensureLoop();
    };
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
  }

  const fullProgress =
    fullDuration > 0 ? Math.min(1, Math.max(0, fullTime / fullDuration)) : 0;
  const selectedSlice =
    SLICES.find((slice) => slice.id === selectedSliceId) ?? SLICES[0];
  const selectedSliceActive = mode === selectedSlice.id;
  const selectedSlicePlaying = selectedSliceActive && playing;
  const selectedClipLength = selectedSlice.endSec - selectedSlice.startSec;
  const selectedElapsed = selectedSliceActive ? sliceElapsed : 0;
  const selectedProgress =
    selectedClipLength > 0
      ? Math.min(1, selectedElapsed / selectedClipLength)
      : 0;
  const selectedWave = selectedSlice.wave.flatMap((height, index) => {
    const nextHeight = selectedSlice.wave[index + 1] ?? height;
    return [height, Math.round((height + nextHeight) / 2)];
  });

  return (
    <>
      <aside className={styles.humanBridge} aria-label="最后一层，不来自模型">
        <p className={styles.humanEn} aria-hidden="true">
          THE LAST LAYER IS HUMAN
        </p>
        <p className={styles.humanTitle}>最后一层，不来自模型。</p>
        <p className={styles.humanFlow} aria-hidden="true">
          LISTEN → COMPARE → ADJUST → RETAIN
        </p>
        <p className={styles.humanLead}>
          模型把不同的可能一层层叠出来，
          <br />
          最后留下哪一块，由人决定。
        </p>
      </aside>

      <section className={styles.selected} aria-labelledby="process-selected-title">
        <header className={styles.selectedHead}>
          <div>
            <p className={styles.selectedEn} aria-hidden="true">
              SELECTED SLICES / 02
            </p>
            <h2 id="process-selected-title" className={styles.selectedTitle}>
              精选切片
            </h2>
          </div>
          <p className={styles.selectedLead}>
            把整首歌摊开，
            <br />
            两个最能代表它的瞬间就在这里。
          </p>
        </header>

        <div className={styles.timelineShell}>
          <div className={styles.timelineTop}>
            <div>
              <span>FULL TRACK / 自动续费</span>
              <strong>一首歌，两处被留下的瞬间</strong>
            </div>
            <span>{FULL_DURATION_LABEL}</span>
          </div>

          <div className={styles.timelineRail} aria-label="《自动续费》歌曲时间轴">
            <div className={styles.timelineRuler} aria-hidden="true">
              {["00:00", "00:30", "01:00", "01:30", "02:00", FULL_DURATION_LABEL].map(
                (label) => (
                  <span key={label}>{label}</span>
                ),
              )}
            </div>
            <div className={styles.timelineBase} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className={styles.timelineWindows}>
              {SLICES.map((slice, index) => {
                const selected = selectedSlice.id === slice.id;
                const active = mode === slice.id;
                const progress =
                  active && slice.endSec > slice.startSec
                    ? Math.min(
                        1,
                        sliceElapsed / (slice.endSec - slice.startSec),
                      )
                    : 0;

                return (
                  <button
                    key={slice.id}
                    type="button"
                    className={`${styles.timelineSlice}${selected ? ` ${styles.timelineSliceSelected}` : ""}`}
                    style={{
                      left: `${(slice.startSec / fullDuration) * 100}%`,
                      width: `${((slice.endSec - slice.startSec) / fullDuration) * 100}%`,
                    }}
                    aria-pressed={selected}
                    aria-label={`选择 ${slice.label}，${slice.rangeLabel}`}
                    onClick={() => {
                      selectSlice(slice.id);
                    }}
                  >
                    <span
                      className={styles.timelineSliceFill}
                      style={{ transform: `scaleX(${progress})` }}
                      aria-hidden="true"
                    />
                    <strong>0{index + 1}</strong>
                    <span>{slice.rangeLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <article className={styles.timelineDetail} aria-live="polite">
            <div className={styles.timelineDetailIndex} aria-hidden="true">
              <strong>{selectedSlice.id === "slice-01" ? "01" : "02"}</strong>
              <span>{selectedSlice.label}</span>
            </div>

            <div className={styles.timelineDetailCopy}>
              <div className={styles.timelineDetailMeta}>
                <span>{selectedSlice.rangeLabel}</span>
                <span>{selectedSlice.durationLabel} SELECTED MOMENT</span>
              </div>

              <div className={styles.timelineLyrics}>
                <KaraokeLyrics
                  lines={selectedSlice.lyrics}
                  timings={selectedSlice.lyricTimings}
                  elapsed={selectedElapsed}
                  active={
                    selectedSliceActive &&
                    (selectedSlicePlaying || selectedElapsed > 0)
                  }
                />
              </div>

              <div className={styles.timelinePlayer}>
                <button
                  type="button"
                  className={`${styles.slicePlay}${selectedSlicePlaying ? ` ${styles.slicePlayActive}` : ""}`}
                  aria-label={
                    selectedSlicePlaying
                      ? `暂停 ${selectedSlice.label}`
                      : `播放 ${selectedSlice.label}`
                  }
                  onClick={() => {
                    void toggleSlice(selectedSlice.id);
                  }}
                >
                  <span className={styles.slicePlayIcon} aria-hidden="true" />
                </button>

                <div className={styles.sliceMonitor}>
                  <div className={styles.sliceMonitorHead}>
                    <span>SIGNAL / {selectedSlice.label}</span>
                    <strong>{selectedSlicePlaying ? "PLAYING" : "READY"}</strong>
                  </div>

                  <div className={styles.sliceSeam} aria-hidden="true">
                    <span className={styles.sliceSeamBase}>
                      {selectedWave.map((height, index) => (
                        <i
                          key={`base-${index}`}
                          className={styles.sliceWaveBar}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </span>
                    <span
                      className={styles.sliceSeamFill}
                      style={{
                        clipPath: `inset(0 ${100 - selectedProgress * 100}% 0 0)`,
                      }}
                    >
                      {selectedWave.map((height, index) => (
                        <i
                          key={`fill-${index}`}
                          className={styles.sliceWaveBar}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </span>
                    <span
                      className={styles.sliceSeamThumb}
                      style={{ left: `${selectedProgress * 100}%` }}
                    />
                  </div>
                </div>

                <div className={styles.sliceTime}>
                  <span className={styles.sliceTimeNow}>
                    {formatTime(selectedElapsed)}
                  </span>
                  <span className={styles.sliceTimeRule} />
                  <span className={styles.sliceTimeDur}>
                    {selectedSlice.durationLabel}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.final} aria-labelledby="process-final-title">
        <header className={styles.finalHead}>
          <p className={styles.finalEn} aria-hidden="true">
            THE FINAL SLICE
          </p>
          <h2 id="process-final-title" className={styles.finalTitle}>
            所有层，终于对齐。
          </h2>
          <p className={styles.finalLead}>
            当情绪、歌词、节奏、人声与质感叠在一起，
            <br />
            它才真正成为《自动续费》。
          </p>
        </header>

        <div className={styles.finalReveal}>
          <div className={styles.finalCake} aria-hidden="true">
            <div className={styles.finalStack}>
              {ALIGNED_LAYERS.map((layer) => (
                <div key={layer.en} className={styles.finalLayer}>
                  <span>{layer.en}</span>
                  <span>{layer.cn}</span>
                </div>
              ))}
            </div>
            <div className={styles.finalCover}>
              <Image
                src={COVER}
                alt=""
                fill
                sizes="(max-width: 767px) 58vw, 280px"
                className={styles.coverImg}
              />
            </div>
          </div>

          <div className={styles.finalMeta}>
            <p className={styles.finalTag}>FINAL OUTPUT</p>
            <p className={styles.finalSong}>自动续费</p>
            <p className={styles.finalDuration}>{FULL_DURATION_LABEL}</p>
          </div>

          <div className={styles.fullPlayer}>
            <button
              type="button"
              className={`${styles.fullPlay}${mode === "full" && playing ? ` ${styles.fullPlayActive}` : ""}`}
              aria-label={
                mode === "full" && playing
                  ? "暂停完整成品"
                  : "播放完整成品"
              }
              onClick={() => {
                void toggleFull();
              }}
            >
              <span className={styles.fullPlayIcon} aria-hidden="true" />
            </button>

            <div className={styles.fullBody}>
              <div className={styles.fullLabels}>
                <span>播放完整成品</span>
                <span aria-hidden="true">PLAY THE FINAL SLICE</span>
              </div>
              <div
                className={styles.fullTrack}
                role="slider"
                aria-label="完整成品进度"
                aria-valuemin={0}
                aria-valuemax={Math.round(fullDuration)}
                aria-valuenow={Math.round(fullTime)}
                tabIndex={0}
                onPointerDown={onSeekPointerDown}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    seekFull(Math.min(1, fullProgress + 0.02));
                  }
                  if (event.key === "ArrowLeft") {
                    seekFull(Math.max(0, fullProgress - 0.02));
                  }
                }}
              >
                <span
                  className={styles.fullFill}
                  style={{ transform: `scaleX(${fullProgress})` }}
                />
              </div>
              <div className={styles.fullTimes}>
                <span>{formatTime(fullTime)}</span>
                <span>{FULL_DURATION_LABEL}</span>
              </div>
            </div>

            <button
              type="button"
              className={`${styles.muteBtn}${muted ? ` ${styles.muteBtnOn}` : ""}`}
              aria-label={muted ? "取消静音" : "静音"}
              onClick={() => setMuted((value) => !value)}
            >
              <span aria-hidden="true">{muted ? "MUTE" : "VOL"}</span>
            </button>
          </div>

          <Link
            className={styles.finalCta}
            href="/about"
            transitionTypes={["nav-forward"]}
          >
            <span className={styles.finalCtaMeta}>NEXT / ABOUT</span>
            <strong>继续认识我 ↗</strong>
          </Link>
        </div>
      </section>
    </>
  );
}
