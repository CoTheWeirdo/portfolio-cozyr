"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./process-page.module.css";

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
    wave: [36, 52, 44, 68, 40, 74, 48, 62, 38, 70, 46, 58, 42, 66, 50, 72, 44, 60],
  },
  {
    id: "slice-02" as const,
    label: "SLICE 02",
    startSec: 70,
    endSec: 79,
    fadeStartSec: 78,
    rangeLabel: "01:10—01:19",
    durationLabel: "00:09",
    lyrics: [
      "午餐照片看起来不错",
      "其实味道也就差不多",
      "群聊里都在庆祝生活",
      "我打了个笑脸跟着附和",
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

export default function ProcessAudioExperience() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    if (!muted) audio.volume = 1;
  }, [muted]);

  const finishSlice = useCallback(() => {
    const audio = audioRef.current;
    stopRaf();
    fadingRef.current = false;
    if (audio) {
      audio.pause();
      audio.volume = muted ? 0 : 1;
    }
    modeRef.current = null;
    setMode(null);
    setPlaying(false);
    setSliceElapsed(0);
  }, [muted, stopRaf]);

  const tick = useEffectEvent(() => {
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
      rafRef.current = requestAnimationFrame(() => tick());
      return;
    }

    const slice = SLICES.find((item) => item.id === currentMode);
    if (!slice) {
      rafRef.current = null;
      return;
    }

    const elapsed = Math.max(0, audio.currentTime - slice.startSec);
    const clipLen = slice.endSec - slice.startSec;
    setSliceElapsed(Math.min(clipLen, elapsed));

    if (!fadingRef.current && audio.currentTime >= slice.fadeStartSec) {
      fadingRef.current = true;
      const startVol = muted ? 0 : 1;
      const startAt = performance.now();
      const durationMs = Math.max(
        80,
        (slice.endSec - Math.min(audio.currentTime, slice.endSec)) * 1000,
      );

      const tickFade = (now: number) => {
        if (!fadingRef.current || modeRef.current !== currentMode) {
          rafRef.current = null;
          return;
        }
        const t = Math.min(1, (now - startAt) / durationMs);
        if (!muted) audio.volume = Math.max(0, startVol * (1 - t));
        setSliceElapsed(
          Math.min(clipLen, Math.max(0, audio.currentTime - slice.startSec)),
        );
        if (t < 1 && audio.currentTime < slice.endSec) {
          rafRef.current = requestAnimationFrame(tickFade);
          return;
        }
        finishSlice();
      };

      rafRef.current = requestAnimationFrame(tickFade);
      return;
    }

    if (!fadingRef.current && audio.currentTime >= slice.endSec) {
      finishSlice();
      return;
    }

    rafRef.current = requestAnimationFrame(() => tick());
  });

  const ensureLoop = useCallback(() => {
    if (rafRef.current == null && modeRef.current && audioRef.current && !audioRef.current.paused) {
      rafRef.current = requestAnimationFrame(() => tick());
    }
  }, [tick]);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setFullDuration(audio.duration);
      }
    };
    const onEnded = () => {
      stopRaf();
      restoreVolume();
      modeRef.current = null;
      setMode(null);
      setPlaying(false);
      setFullTime(0);
      setSliceElapsed(0);
      audio.currentTime = 0;
    };

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnded);

    return () => {
      stopRaf();
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [restoreVolume, stopRaf]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (!muted && !fadingRef.current) audio.volume = 1;
  }, [muted]);

  async function startMode(next: Exclude<Mode, null>, atSec: number) {
    const audio = audioRef.current;
    if (!audio) return;

    stopRaf();
    fadingRef.current = false;
    audio.pause();
    audio.volume = muted ? 0 : 1;
    modeRef.current = next;
    setMode(next);
    setSliceElapsed(0);
    if (next === "full") setFullTime(atSec);

    const seek = () => {
      audio.currentTime = atSec;
    };
    seek();
    if (audio.readyState < 1) {
      await new Promise<void>((resolve) => {
        const onReady = () => {
          audio.removeEventListener("loadedmetadata", onReady);
          resolve();
        };
        audio.addEventListener("loadedmetadata", onReady);
      });
      seek();
    }

    try {
      await audio.play();
      setPlaying(true);
      ensureLoop();
    } catch {
      setPlaying(false);
      modeRef.current = null;
      setMode(null);
    }
  }

  async function toggleSlice(sliceId: "slice-01" | "slice-02") {
    const audio = audioRef.current;
    const slice = SLICES.find((item) => item.id === sliceId);
    if (!audio || !slice) return;

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
    const audio = audioRef.current;
    if (!audio) return;
    const duration =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : fullDuration;
    const next = Math.min(duration, Math.max(0, ratio * duration));
    if (modeRef.current !== "full") {
      stopRaf();
      fadingRef.current = false;
      modeRef.current = "full";
      setMode("full");
      setSliceElapsed(0);
      restoreVolume();
      setPlaying(!audio.paused);
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
          <p className={styles.selectedEn} aria-hidden="true">
            SELECTED SLICES / 02
          </p>
          <h2 id="process-selected-title" className={styles.selectedTitle}>
            精选切片
          </h2>
          <p className={styles.selectedLead}>
            从完整成品里，
            <br />
            切下最能代表它的两块。
          </p>
        </header>

        <div className={styles.selectedList}>
          {SLICES.map((slice) => {
            const active = mode === slice.id;
            const isPlaying = active && playing;
            const clipLen = slice.endSec - slice.startSec;
            const elapsed = active ? sliceElapsed : 0;
            const progress = clipLen > 0 ? Math.min(1, elapsed / clipLen) : 0;
            const mirrored = slice.id === "slice-02";

            return (
              <article
                key={slice.id}
                className={`${styles.selectedItem}${mirrored ? ` ${styles.selectedItemMirror}` : ` ${styles.selectedItemLeft}`}`}
              >
                <div className={styles.selectedMeta}>
                  <span className={styles.selectedLabel}>{slice.label}</span>
                  <span className={styles.sliceRange}>{slice.rangeLabel}</span>
                </div>

                <div className={styles.selectedLyric}>
                  {slice.lyrics.map((line, lineIndex) => (
                    <p key={`${slice.id}-${lineIndex}`}>{line}</p>
                  ))}
                </div>

                <div className={styles.selectedPlayer}>
                  <button
                    type="button"
                    className={`${styles.slicePlay}${isPlaying ? ` ${styles.slicePlayActive}` : ""}`}
                    aria-label={
                      isPlaying
                        ? `暂停 ${slice.label}`
                        : `播放 ${slice.label}`
                    }
                    onClick={() => {
                      void toggleSlice(slice.id);
                    }}
                  >
                    <span className={styles.slicePlayIcon} aria-hidden="true" />
                  </button>

                  <div className={styles.sliceTrack} aria-hidden="true">
                    <span className={styles.sliceTrackGrain} />
                    <span
                      className={styles.sliceTrackFill}
                      style={{ transform: `scaleX(${progress})` }}
                    />
                    <span
                      className={styles.sliceTrackThumb}
                      style={{ left: `${progress * 100}%` }}
                    />
                  </div>

                  <p className={styles.sliceTime}>
                    {formatTime(elapsed)} / {slice.durationLabel}
                  </p>
                </div>
              </article>
            );
          })}
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
                sizes="(max-width: 767px) 42vw, 11rem"
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
        </div>
      </section>
    </>
  );
}
