export type VoiceoverHandle = {
  cancel: () => void;
};

type VoiceoverOptions = {
  text: string;
  audioSrc?: string;
  enabled?: boolean;
  volume?: number;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
};

const preferredVoiceNames = [
  "Microsoft Zira",
  "Microsoft Jenny",
  "Microsoft Aria",
  "Google UK English Female",
  "Google US English",
  "Samantha",
  "Victoria",
  "Karen",
  "Moira"
];

function browserVoices() {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}

export function chooseNarratorVoice() {
  const voices = browserVoices();
  return (
    voices.find((voice) => preferredVoiceNames.some((name) => voice.name.toLowerCase().includes(name.toLowerCase()))) ??
    voices.find((voice) => /female|woman|zira|jenny|aria|samantha|victoria|karen|moira/i.test(voice.name)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ??
    null
  );
}

export function estimateVoiceoverMs(text: string, rate = 0.82) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 118 * rate;
  return Math.min(11000, Math.max(1800, (wordCount / wordsPerMinute) * 60_000 + 700));
}

export function playVoiceoverLine({
  text,
  audioSrc,
  enabled = true,
  volume = 0.82,
  rate = 0.78,
  pitch = 1.34,
  onEnd
}: VoiceoverOptions): VoiceoverHandle {
  if (!enabled || typeof window === "undefined") {
    const fallbackId = window.setTimeout(() => onEnd?.(), estimateVoiceoverMs(text, rate));
    return { cancel: () => window.clearTimeout(fallbackId) };
  }

  let cancelled = false;
  let audio: HTMLAudioElement | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    onEnd?.();
  };

  const speakFallback = () => {
    if (cancelled) return;
    if (!("speechSynthesis" in window)) {
      timeoutId = setTimeout(finish, estimateVoiceoverMs(text, rate));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = chooseNarratorVoice();
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang ?? "en-US";
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onend = finish;
    utterance.onerror = finish;
    timeoutId = setTimeout(finish, estimateVoiceoverMs(text, rate) + 2500);
    window.speechSynthesis.speak(utterance);
  };

  if (audioSrc) {
    audio = new Audio(audioSrc);
    audio.preload = "auto";
    audio.volume = volume;
    audio.onended = finish;
    audio.onerror = speakFallback;
    audio.play().catch(speakFallback);
  } else {
    speakFallback();
  }

  return {
    cancel: () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  };
}
