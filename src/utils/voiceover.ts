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

const piperVoiceId = "en_US-hfc_female-medium";
const localPiperModelBase = "/models/voice/en_US-hfc_female-medium";
let piperSeedPromise: Promise<void> | null = null;
let piperUnavailable = false;

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

async function cacheLocalFileInOpfs(url: string, fileName: string) {
  if (!navigator.storage?.getDirectory) return;
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle("piper", { create: true });
  try {
    await dir.getFileHandle(fileName);
    return;
  } catch {
    // File is not cached yet.
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load local Piper asset: ${url}`);
  const file = await dir.getFileHandle(fileName, { create: true });
  const writable = await file.createWritable();
  await writable.write(await response.blob());
  await writable.close();
}

function seedLocalPiperVoice() {
  if (!piperSeedPromise) {
    piperSeedPromise = Promise.all([
      cacheLocalFileInOpfs(`${localPiperModelBase}.onnx`, `${piperVoiceId}.onnx`),
      cacheLocalFileInOpfs(`${localPiperModelBase}.onnx.json`, `${piperVoiceId}.onnx.json`)
    ]).then(() => undefined);
  }
  return piperSeedPromise;
}

async function synthesizeWithPiper(text: string) {
  if (piperUnavailable) return null;
  try {
    await seedLocalPiperVoice();
    const tts = await import("@mintplex-labs/piper-tts-web");
    return await tts.predict({ text, voiceId: piperVoiceId });
  } catch (error) {
    piperUnavailable = true;
    console.warn("Piper voiceover unavailable, falling back to browser speech.", error);
    return null;
  }
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
  let objectUrl: string | null = null;

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    onEnd?.();
  };

  const playAudioFile = (src: string, onError: () => void) => {
    if (cancelled) return;
    audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = volume;
    audio.onended = finish;
    audio.onerror = onError;
    audio.play().catch(onError);
  };

  const playPiperFallback = () => {
    if (cancelled) return;
    synthesizeWithPiper(text).then((blob) => {
      if (cancelled) return;
      if (!blob) {
        browserSpeechFallback();
        return;
      }
      objectUrl = URL.createObjectURL(blob);
      playAudioFile(objectUrl, browserSpeechFallback);
    });
  };

  const browserSpeechFallback = () => {
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
    playAudioFile(audioSrc, playPiperFallback);
  } else {
    playPiperFallback();
  }

  return {
    cancel: () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  };
}
