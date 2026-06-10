export type VoiceoverHandle = {
  cancel: () => void;
};

type VoiceoverOptions = {
  text: string;
  enabled?: boolean;
  volume?: number;
  rate?: number;
  pitch?: number;
  browserFallback?: boolean;
  onEnd?: () => void;
  onStart?: () => void;
};

const piperVoiceId = "en_US-hfc_female-medium";
const localPiperModelBase = "/models/voice/en_US-hfc_female-medium";
let piperSeedPromise: Promise<void> | null = null;
let piperUnavailable = false;
let piperWarmupPromise: Promise<boolean> | null = null;
let activeVoiceoverCancel: (() => void) | null = null;
const piperBlobCache = new Map<string, Blob>();
const piperBlobPromiseCache = new Map<string, Promise<Blob | null>>();

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

function chooseNarratorVoice() {
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

function piperCacheKey(text: string) {
  return `${piperVoiceId}:${text}`;
}

async function synthesizeWithPiper(text: string) {
  if (piperUnavailable) return null;
  const cacheKey = piperCacheKey(text);
  const cached = piperBlobCache.get(cacheKey);
  if (cached) return cached;
  const cachedPromise = piperBlobPromiseCache.get(cacheKey);
  if (cachedPromise) return cachedPromise;

  const promise = (async () => {
    try {
      await seedLocalPiperVoice();
      const tts = await import("@mintplex-labs/piper-tts-web");
      const blob = await tts.predict({ text, voiceId: piperVoiceId });
      if (blob) piperBlobCache.set(cacheKey, blob);
      return blob;
    } catch (error) {
      piperUnavailable = true;
      console.warn("Piper voiceover unavailable. Falling back to browser speech for this line.", error);
      return null;
    } finally {
      piperBlobPromiseCache.delete(cacheKey);
    }
  })();

  piperBlobPromiseCache.set(cacheKey, promise);
  return promise;
}

export async function preloadVoiceoverLines(lines: string[]) {
  if (piperUnavailable || !lines.length) return false;
  try {
    const uniqueLines = [...new Set(lines.map((line) => line.trim()).filter(Boolean))];
    const results = await Promise.all(uniqueLines.map((line) => synthesizeWithPiper(line)));
    return results.every(Boolean);
  } catch {
    return false;
  }
}

export function prepareVoiceoverEngine() {
  if (!piperWarmupPromise) {
    piperWarmupPromise = synthesizeWithPiper("Voice ready.")
      .then((blob) => {
        if (blob) URL.revokeObjectURL(URL.createObjectURL(blob));
        return Boolean(blob);
      })
      .catch(() => false);
  }
  return piperWarmupPromise;
}

export function playVoiceoverLine({
  text,
  enabled = true,
  volume = 0.82,
  rate = 0.78,
  browserFallback = true,
  onEnd,
  onStart
}: VoiceoverOptions): VoiceoverHandle {
  if (!enabled || typeof window === "undefined") {
    const fallbackId = window.setTimeout(() => onEnd?.(), estimateVoiceoverMs(text, rate));
    return { cancel: () => window.clearTimeout(fallbackId) };
  }

  let cancelled = false;
  let audio: HTMLAudioElement | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let objectUrl: string | null = null;
  let finished = false;

  activeVoiceoverCancel?.();

  const finish = () => {
    if (cancelled || finished) return;
    finished = true;
    cancelled = true;
    if (activeVoiceoverCancel === cancel) activeVoiceoverCancel = null;
    if (timeoutId) clearTimeout(timeoutId);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    onEnd?.();
  };

  const finishSilently = () => {
    if (cancelled) return;
    timeoutId = setTimeout(finish, estimateVoiceoverMs(text, rate));
  };

  const playAudioFile = (src: string, onError: () => void = browserSpeechFallback) => {
    if (cancelled || finished) return;
    audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = volume;
    audio.onplay = () => onStart?.();
    audio.onended = finish;
    audio.onerror = onError;
    audio.play().catch(onError);
  };

  const cancel = () => {
    cancelled = true;
    finished = true;
    if (activeVoiceoverCancel === cancel) activeVoiceoverCancel = null;
    if (timeoutId) clearTimeout(timeoutId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const playPiper = () => {
    if (cancelled) return;
    synthesizeWithPiper(text).then((blob) => {
      if (cancelled) return;
      if (!blob) {
        if (browserFallback) {
          browserSpeechFallback();
        } else {
          finishSilently();
        }
        return;
      }
      objectUrl = URL.createObjectURL(blob);
      playAudioFile(objectUrl, browserFallback ? browserSpeechFallback : finishSilently);
    });
  };

  const browserSpeechFallback = () => {
    if (cancelled || finished) return;
    if (!("speechSynthesis" in window)) {
      finishSilently();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = chooseNarratorVoice();
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang ?? "en-US";
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = 1.2;
    utterance.onstart = () => onStart?.();
    utterance.onend = finish;
    utterance.onerror = finish;
    timeoutId = setTimeout(finish, estimateVoiceoverMs(text, rate) + 2500);
    window.speechSynthesis.speak(utterance);
  };

  activeVoiceoverCancel = cancel;
  playPiper();

  return {
    cancel
  };
}
