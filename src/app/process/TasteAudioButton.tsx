"use client";

import { useEffect, useRef, useState } from "react";
import {
  claimProcessAudioPlayback,
  getClaimedProcessAudio,
  PROCESS_AUDIO_PLAY_EVENT,
} from "./processAudioEvents";

type TasteAudioButtonProps = {
  src: string;
  label: string;
  className: string;
  activeClassName: string;
};

export default function TasteAudioButton({
  src,
  label,
  className,
  activeClassName,
}: TasteAudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const stopForAnotherAudio = (event: Event) => {
      if (getClaimedProcessAudio(event) !== audio) audio.pause();
    };

    audio.load();
    window.addEventListener(PROCESS_AUDIO_PLAY_EVENT, stopForAnotherAudio);
    return () => {
      window.removeEventListener(PROCESS_AUDIO_PLAY_EVENT, stopForAnotherAudio);
    };
  }, [src]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    claimProcessAudioPlayback(audio);
    if (audio.ended) audio.currentTime = 0;

    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={`${className}${playing ? ` ${activeClassName}` : ""}`}
        aria-label={playing ? `暂停${label}` : `播放${label}`}
        aria-pressed={playing}
        onClick={() => {
          void toggle();
        }}
      >
        <i aria-hidden="true" />
      </button>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </>
  );
}
