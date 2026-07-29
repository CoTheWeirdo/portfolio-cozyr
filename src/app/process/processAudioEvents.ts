export const PROCESS_AUDIO_PLAY_EVENT = "process-audio-play";

export function claimProcessAudioPlayback(audio: HTMLAudioElement) {
  window.dispatchEvent(
    new CustomEvent<HTMLAudioElement>(PROCESS_AUDIO_PLAY_EVENT, {
      detail: audio,
    }),
  );
}

export function getClaimedProcessAudio(event: Event) {
  return (event as CustomEvent<HTMLAudioElement>).detail;
}
