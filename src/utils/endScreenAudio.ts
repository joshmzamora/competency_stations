const themeSrc = "/audio/squid_game_theme.mp3";
const congratulationsSrc = "/audio/confetti_and_cheers.mp3";

type EndScreenTrack = "theme" | "congratulations";

const trackSources: Record<EndScreenTrack, string> = {
  theme: themeSrc,
  congratulations: congratulationsSrc
};

const tracks: Partial<Record<EndScreenTrack, HTMLAudioElement>> = {};

function getTrack(track: EndScreenTrack) {
  if (typeof Audio === "undefined") return null;
  if (!tracks[track]) {
    const audio = new Audio(trackSources[track]);
    audio.preload = "auto";
    tracks[track] = audio;
  }
  return tracks[track] ?? null;
}

export function playEndScreenTrack(track: EndScreenTrack, options: { volume: number; loop?: boolean; restart?: boolean }) {
  const audio = getTrack(track);
  if (!audio) return;

  audio.loop = Boolean(options.loop);
  audio.volume = options.volume;
  if (options.restart) audio.currentTime = 0;

  const playPromise = audio.play();
  if (playPromise) playPromise.catch(() => undefined);
}

export function stopEndScreenTrack(track: EndScreenTrack, reset = true) {
  const audio = tracks[track];
  if (!audio) return;
  audio.pause();
  if (reset) audio.currentTime = 0;
}

export function stopAllEndScreenTracks() {
  stopEndScreenTrack("theme");
  stopEndScreenTrack("congratulations");
}

