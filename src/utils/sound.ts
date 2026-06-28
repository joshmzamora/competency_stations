import type { EvaluationStatus } from "../types";

type WebAudioWindow = typeof window & { webkitAudioContext?: typeof AudioContext };
export type AudioRole = "host" | "player";
export type AudioChannel = "effects" | "tracks";

const audioEnabledByRole: Record<AudioRole, Record<AudioChannel, boolean>> = {
  host: {
    effects: true,
    tracks: true
  },
  player: {
    effects: false,
    tracks: false
  }
};

export function isAudioEnabledForRole(role: AudioRole, channel: AudioChannel = "effects") {
  return audioEnabledByRole[role][channel];
}

function getAudioContext() {
  const AudioContextConstructor = window.AudioContext || (window as WebAudioWindow).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  const context = new AudioContextConstructor();
  void context.resume().catch(() => undefined);
  return context;
}

function envelope(gain: GainNode, context: AudioContext, volume: number, start: number, attack = 0.015, release = 0.18) {
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + release);
}

function playTone(context: AudioContext, frequency: number, start: number, duration: number, volume: number, type: OscillatorType = "sine") {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  envelope(gain, context, volume, start, 0.012, duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function closeLater(context: AudioContext, delay = 900) {
  window.setTimeout(() => void context.close().catch(() => undefined), delay);
}

export function playEvaluationCue(status: EvaluationStatus, subtle = false) {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const volume = subtle ? 0.15 : 0.4;
  const sequence =
    status === "correct"
      ? [523.25, 659.25, 783.99, 1046.5]
      : status === "partial"
        ? [392, 493.88, 440]
        : [196, 174.61, 146.83];
  const type: OscillatorType = status === "incorrect" ? "sawtooth" : status === "partial" ? "triangle" : "sine";

  sequence.forEach((frequency, index) => {
    playTone(context, frequency, now + index * 0.09, status === "correct" ? 0.2 : 0.16, volume, type);
  });

  if (status === "incorrect") {
    playTone(context, 98, now + 0.04, 0.42, subtle ? 0.1 : 0.2, "square");
  }

  closeLater(context, 950);
}

export function playQuestionAdvanceCue() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;

  [330, 440, 587.33].forEach((frequency, index) => {
    playTone(context, frequency, now + index * 0.055, 0.14, 0.2, "triangle");
  });
  closeLater(context, 600);
}

export function playActivityDropCue() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;

  playTone(context, 220, now, 0.1, 0.15, "triangle");
  playTone(context, 330, now + 0.04, 0.12, 0.18, "sine");
  closeLater(context, 420);
}

export function playActivityCheckCue() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;

  playTone(context, 174.61, now, 0.18, 0.2, "sawtooth");
  [349.23, 523.25, 698.46].forEach((frequency, index) => {
    playTone(context, frequency, now + 0.11 + index * 0.075, 0.18, 0.25, "triangle");
  });
  closeLater(context, 780);
}

export function playStationTransitionCue() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;

  [130.81, 196, 261.63, 392].forEach((frequency, index) => {
    playTone(context, frequency, now + index * 0.11, 0.26, 0.25, index === 0 ? "sawtooth" : "sine");
  });
  playTone(context, 65.41, now, 0.62, 0.1, "triangle");
  closeLater(context, 1000);
}

export function playFileClickCue() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;

  playTone(context, 880, now, 0.08, 0.5, "sine");
  playTone(context, 1200, now + 0.05, 0.1, 0.4, "sine");
  closeLater(context, 400);
}

export function playTimesUpCue() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;

  playTone(context, 220, now, 0.15, 0.3, "sawtooth");
  playTone(context, 180, now + 0.15, 0.3, 0.3, "sawtooth");
  closeLater(context, 800);
}

export function playTimerTickCue() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;

  playTone(context, 1000, now, 0.05, 0.1, "square");
  closeLater(context, 200);
}

export function playTimerUrgentCue() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;

  playTone(context, 1200, now, 0.1, 0.2, "sawtooth");
  playTone(context, 1400, now + 0.1, 0.1, 0.2, "sawtooth");
  closeLater(context, 400);
}
