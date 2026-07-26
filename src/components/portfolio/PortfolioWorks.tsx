"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import HearVinylIntro from "@/components/portfolio/hear/HearVinylIntro";
import HearSideA from "@/components/portfolio/hear/HearSideA";
import HearSideB, { aiTracks } from "@/components/portfolio/hear/HearSideB";
import { CLIP_DURATION_SEC, hexToRgb, works } from "@/data/portfolioContent";
import "@/components/portfolio/hear/hear-page.css";

type View = "vinyl" | "a" | "b";
type VinylMode = "intro" | "return" | "static";

const INTRO_KEY = "hear-vinyl-intro-played";

export default function PortfolioWorks() {
  const reduceMotion = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);
  const clipStopRef = useRef<number | null>(null);

  const [view, setView] = useState<View>("vinyl");
  const [vinylMode, setVinylMode] = useState<VinylMode>("static");
  const [highlight, setHighlight] = useState<"a" | "b">("a");

  const [selectedA, setSelectedA] = useState(works[0]?.id ?? 1);
  const [selectedB, setSelectedB] = useState<string>(aiTracks[0]?.id ?? "auto-renewal");
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipElapsed, setClipElapsed] = useState(0);
  const [clipProgress, setClipProgress] = useState(0);

  const playingA =
    playingKey?.startsWith("a:") && isPlaying
      ? Number(playingKey.slice(2))
      : null;
  const playingB =
    playingKey?.startsWith("b:") && isPlaying ? playingKey.slice(2) : null;

  const activeWork =
    typeof playingA === "number" ? works.find((w) => w.id === playingA) : null;

  const listeningStyle = {
    "--listening-a": activeWork ? hexToRgb(activeWork.glow) : "185 180 216",
    "--listening-b": activeWork ? hexToRgb(activeWork.glowSoft) : "80 137 169",
    "--listening-c": activeWork ? hexToRgb(activeWork.glow) : "164 92 72",
  } as CSSProperties;

  useEffect(() => {
    if (reduceMotion) {
      setVinylMode("static");
      return;
    }
    try {
      const played = sessionStorage.getItem(INTRO_KEY) === "1";
      setVinylMode(played ? "static" : "intro");
    } catch {
      setVinylMode("intro");
    }
  }, [reduceMotion]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (clipStopRef.current !== null) {
      window.clearInterval(clipStopRef.current);
      clipStopRef.current = null;
    }
    setIsPlaying(false);
    setPlayingKey(null);
    setClipElapsed(0);
    setClipProgress(0);
  }, []);

  const playClip = useCallback(
    async (key: string, src: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (playingKey === key && isPlaying) {
        stopAudio();
        return;
      }

      if (clipStopRef.current !== null) {
        window.clearInterval(clipStopRef.current);
        clipStopRef.current = null;
      }

      setPlayingKey(key);
      setClipElapsed(0);
      setClipProgress(0);
      audio.src = src;
      audio.load();
      audio.currentTime = 0;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
        setPlayingKey(null);
        return;
      }

      clipStopRef.current = window.setInterval(() => {
        const current = audioRef.current;
        if (!current) return;
        const t = current.currentTime;
        setClipElapsed(t);
        setClipProgress(Math.min(1, t / CLIP_DURATION_SEC));
        if (t >= CLIP_DURATION_SEC - 0.05) {
          current.pause();
          current.currentTime = 0;
          setIsPlaying(false);
          setPlayingKey(null);
          setClipElapsed(0);
          setClipProgress(0);
          if (clipStopRef.current !== null) {
            window.clearInterval(clipStopRef.current);
            clipStopRef.current = null;
          }
        }
      }, 80);
    },
    [isPlaying, playingKey, stopAudio],
  );

  useEffect(() => () => stopAudio(), [stopAudio]);

  useEffect(() => {
    stopAudio();
  }, [view, stopAudio]);

  const goToSide = useCallback((side: "a" | "b") => {
    setHighlight(side);
    setView(side);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const backToRecord = useCallback(() => {
    stopAudio();
    setView("vinyl");
    setVinylMode(reduceMotion ? "static" : "return");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [reduceMotion, stopAudio]);

  return (
    <PortfolioShell
      className={
        playingA !== null
          ? "portfolio--listening portfolio--works-page"
          : "portfolio--works-page"
      }
      style={listeningStyle}
      ferro="works"
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setPlayingKey(null);
          setClipElapsed(0);
          setClipProgress(0);
        }}
      />

      <h1 className="sr-only">听见 — DAW 作品与 AI 协作作品</h1>

      {view === "vinyl" ? (
        <HearVinylIntro
          mode={vinylMode}
          highlight={highlight}
          onSelectA={() => goToSide("a")}
          onSelectB={() => goToSide("b")}
        />
      ) : null}

      {view === "a" ? (
        <HearSideA
          works={works}
          selectedId={selectedA}
          playingId={playingA}
          clipElapsed={clipElapsed}
          clipProgress={clipProgress}
          onSelect={setSelectedA}
          onToggleAudition={(id) => {
            setSelectedA(id);
            const work = works.find((item) => item.id === id);
            if (work) void playClip(`a:${id}`, work.clip);
          }}
          onBackToRecord={backToRecord}
          onTurnToB={() => goToSide("b")}
        />
      ) : null}

      {view === "b" ? (
        <HearSideB
          selectedId={selectedB}
          playingId={playingB}
          clipElapsed={clipElapsed}
          clipProgress={clipProgress}
          onSelect={setSelectedB}
          onToggleAudition={(id) => {
            setSelectedB(id);
            const track = aiTracks.find((item) => item.id === id);
            if (track) void playClip(`b:${id}`, track.audio);
          }}
          onBackToRecord={backToRecord}
          onBackToA={() => goToSide("a")}
        />
      ) : null}
    </PortfolioShell>
  );
}
