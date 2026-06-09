import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Circle,
  Diamond,
  Gauge,
  HeartPulse,
  Hexagon,
  Monitor,
  Radio,
  Stethoscope,
  Square,
  Star,
  Triangle,
  Umbrella
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedButton } from "./AnimatedButton";
import { PatientCaseReview } from "./PatientCaseReview";
import { PhaseBrief } from "./PhaseBrief";
import { playVoiceoverLine, type VoiceoverHandle } from "../utils/voiceover";

const durationMs = 45000;
const sceneMs = durationMs / 6;
const fadeOutMs = 6000;
const maxIntroVolume = 0.15;
const introAudioSrc = "/audio/squid_game_intro.mp3";
const voiceoverVolume = 0.82;

type IntroScene = {
  eyebrow: string;
  title: string;
  lines: string[];
  voiceover: string;
  voiceoverSrc: string;
  purpose: string;
  image?: string;
  visual: "video" | "manikin" | "monitor" | "shapes" | "bedside" | "launch";
  Icon: typeof HeartPulse;
};

const scenes: IntroScene[] = [
  {
    eyebrow: "Simulation Briefing",
    title: "Simulation Briefing",
    lines: ["Welcome to the competency stations.", "This briefing shows how the simulation will feel before the patient case opens."],
    voiceover:
      "Welcome to competency stations. Listen carefully. The simulation begins before the first question is asked.",
    voiceoverSrc: "/audio/voiceover/intro-1.mp3",
    purpose: "Start the scenario with a shared frame before patient details are revealed.",
    image: "/images/intro/medical-mannequin.webp",
    visual: "video",
    Icon: Radio
  },
  {
    eyebrow: "High Fidelity Manikin",
    title: "Realistic Patient Encounter",
    lines: ["The manikin breathes, has a pulse, talks, and has heart sounds.", "Assess Emma like a real patient."],
    voiceover:
      "The manikin breathes. She has a pulse. She can speak. She has heart sounds. Treat Emma like a real ICU patient.",
    voiceoverSrc: "/audio/voiceover/intro-2.mp3",
    purpose: "The manikin is interactive. Assessment should be physical, verbal, and realistic.",
    image: "/images/intro/human-patient-simulation.jpg",
    visual: "manikin",
    Icon: Stethoscope
  },
  {
    eyebrow: "Monitor Awareness",
    title: "Watch The Monitor",
    lines: ["Vital signs and EKG will be on the monitor.", "Pay attention. ICU changes can happen fast."],
    voiceover:
      "Vital signs and EKG will appear on the monitor. Watch closely. In the ICU, a stable patient can change fast.",
    voiceoverSrc: "/audio/voiceover/intro-3.mp3",
    purpose: "Monitor data is part of the scenario, not background decoration.",
    image: "/images/intro/icu-monitor-front.jpg",
    visual: "monitor",
    Icon: Monitor
  },
  {
    eyebrow: "Shape Selection",
    title: "Shape Selection",
    lines: ["Each participant receives a shape.", "When a station question begins, the selection screen will show whose turn it is."],
    voiceover:
      "Each participant will receive a shape. When the station begins, the selection screen decides who is active.",
    voiceoverSrc: "/audio/voiceover/intro-4.mp3",
    purpose: "This prepares participants for the fair selection sequence after the briefing.",
    visual: "shapes",
    Icon: Activity
  },
  {
    eyebrow: "Bedside Orientation",
    title: "Orient To The Patient",
    lines: ["Before the first station, take a moment to orient yourself.", "Feel for a pulse. Auscultate heart and lung sounds. Speak with Emma."],
    voiceover:
      "Before the first station, orient yourself to the bedside. Feel for a pulse. Listen to heart and lung sounds. Speak with Emma.",
    voiceoverSrc: "/audio/voiceover/intro-5.mp3",
    purpose: "Learners should touch, listen, and communicate before the scenario accelerates.",
    image: "/images/intro/checking-vital-signs.jpg",
    visual: "bedside",
    Icon: HeartPulse
  },
  {
    eyebrow: "Scenario Launch",
    title: "Stand By",
    lines: ["Briefing complete.", "Next, review the patient case file.", "Then the first station begins."],
    voiceover:
      "Briefing complete. Next, open the patient case file. Review the details. Then the first station begins.",
    voiceoverSrc: "/audio/voiceover/intro-6.mp3",
    purpose: "The briefing ends here. Patient chart review comes next.",
    image: "/images/intro/vital-signs-monitor.jpg",
    visual: "launch",
    Icon: Gauge
  }
];

function ShapeConstellation() {
  const shapeItems = [
    { label: "Triangle", Icon: Triangle, tone: "text-trauma", delay: 0 },
    { label: "Star", Icon: Star, tone: "text-amber", delay: 0.12 },
    { label: "Umbrella", Icon: Umbrella, tone: "text-white", delay: 0.24 },
    { label: "Circle", Icon: Circle, tone: "text-scrub", delay: 0.36 },
    { label: "Square", Icon: Square, tone: "text-monitor", delay: 0.48 },
    { label: "Diamond", Icon: Diamond, tone: "text-fuchsia-300", delay: 0.6 },
    { label: "Hexagon", Icon: Hexagon, tone: "text-lime-300", delay: 0.72 }
  ];

  return (
    <div className="grid h-full min-h-[520px] place-items-center rounded-md border border-white/10 bg-[#08090b] p-8">
      <div className="grid w-full max-w-5xl grid-cols-2 gap-5 sm:grid-cols-4 xl:grid-cols-7">
        {shapeItems.map(({ label, Icon, tone, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 28, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay, duration: 0.55, ease: "easeOut" }}
            className="grid aspect-square place-items-center rounded-md border border-white/10 bg-white/[0.04]"
          >
            <Icon className={`h-24 w-24 xl:h-32 xl:w-32 ${tone}`} strokeWidth={1.8} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SceneVisual({ scene }: { scene: IntroScene }) {
  if (scene.visual === "shapes") return <ShapeConstellation />;

  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-md border border-white/10 bg-[#090d10] shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
      {scene.image ? (
        <motion.img
          key={scene.image}
          src={scene.image}
          alt=""
          className="h-full min-h-[520px] w-full object-cover"
          initial={{ scale: 1.09, opacity: 0 }}
          animate={{ scale: 1.01, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050607] via-[#050607]/22 to-transparent" />
    </div>
  );
}

export function ScenarioIntro({
  open,
  onClose,
  onSkip,
  canSkip = false,
  role,
  audioEffectsEnabled = true,
  audioTracksEnabled = true,
  patientReviewReviewedFileIds,
  patientReviewActiveFileId,
  onReviewPatientFile,
  isClosing,
  startedAt,
  serverTime
}: {
  open: boolean;
  onClose: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  role: "host" | "player";
  audioEffectsEnabled?: boolean;
  audioTracksEnabled?: boolean;
  patientReviewReviewedFileIds?: string[];
  patientReviewActiveFileId?: string | null;
  onReviewPatientFile?: (fileId: string) => void;
  isClosing?: boolean;
  startedAt?: number | null;
  serverTime?: number;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [introSceneIndex, setIntroSceneIndex] = useState(0);
  const [sceneProgressValue, setSceneProgressValue] = useState(0);
  const [phase, setPhase] = useState<"scenes" | "patient">("scenes");
  const [patientBriefVisible, setPatientBriefVisible] = useState(false);
  const offsetRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStartKeyRef = useRef<string>("");
  const audioRetryNeededRef = useRef(false);
  const voiceoverRef = useRef<VoiceoverHandle | null>(null);
  const patientBriefShownRef = useRef(false);
  const timelineKeyRef = useRef<string>("");
  const sceneIndex = introSceneIndex;
  const scene = scenes[sceneIndex];
  const SceneIcon = scene.Icon;
  const secondsLeft = Math.max(0, Math.ceil(((scenes.length - sceneIndex - 1) * sceneMs + (sceneMs * (100 - sceneProgressValue)) / 100) / 1000));
  const progress = Math.min(100, ((sceneIndex + sceneProgressValue / 100) / scenes.length) * 100);
  const sceneProgress = sceneProgressValue;

  function getSyncedElapsed() {
    return startedAt ? Math.max(0, Date.now() - offsetRef.current - startedAt) : 0;
  }

  function syncIntroAudio(audio: HTMLAudioElement) {
    const syncedElapsed = Math.min(durationMs, getSyncedElapsed());
    const targetTime = syncedElapsed / 1000;
    const remaining = Math.max(0, durationMs - syncedElapsed);
    audio.volume = Math.min(maxIntroVolume, maxIntroVolume * (remaining / fadeOutMs));
    if (Number.isFinite(targetTime) && Math.abs(audio.currentTime - targetTime) > 1.2) {
      audio.currentTime = targetTime;
    }
  }

  function playSyncedIntroAudio() {
    const audio = audioRef.current;
    if (!audio || !audioTracksEnabled || !open || phase !== "scenes") return;
    syncIntroAudio(audio);
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          audioRetryNeededRef.current = false;
        })
        .catch(() => {
          audioRetryNeededRef.current = true;
        });
    }
  }

  function cancelVoiceover() {
    voiceoverRef.current?.cancel();
    voiceoverRef.current = null;
  }

  useEffect(() => {
    if (!open || !startedAt) return;
    patientBriefShownRef.current = false;
    const timelineKey = `${startedAt}`;
    if (timelineKeyRef.current !== timelineKey) {
      offsetRef.current = serverTime ? Date.now() - serverTime : 0;
      timelineKeyRef.current = timelineKey;
      setIntroSceneIndex(0);
      setSceneProgressValue(0);
      setElapsed(0);
      setPhase("scenes");
    }
  }, [open, serverTime, startedAt]);

  useEffect(() => {
    if (!open) {
      timelineKeyRef.current = "";
      cancelVoiceover();
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "scenes") {
      cancelVoiceover();
      return;
    }

    cancelVoiceover();
    let minimumTimePassed = false;
    let voiceoverFinished = !audioTracksEnabled;
    let advanced = false;
    const sceneStartedAt = Date.now();

    const advance = (force = false) => {
      if (advanced || (!force && (!minimumTimePassed || !voiceoverFinished))) return;
      advanced = true;
      setSceneProgressValue(100);
      if (sceneIndex >= scenes.length - 1) {
        setElapsed(durationMs);
        setPhase("patient");
      } else {
        setIntroSceneIndex((current) => Math.min(scenes.length - 1, current + 1));
      }
    };

    const progressInterval = window.setInterval(() => {
      const nextProgress = Math.min(98, ((Date.now() - sceneStartedAt) / sceneMs) * 100);
      setSceneProgressValue(nextProgress);
      setElapsed((sceneIndex + nextProgress / 100) * sceneMs);
    }, 90);

    const minimumTimer = window.setTimeout(() => {
      minimumTimePassed = true;
      advance();
    }, 2600);

    const forceTimer = window.setTimeout(() => {
      voiceoverFinished = true;
      minimumTimePassed = true;
      advance(true);
    }, 12000);

    if (audioTracksEnabled) {
      const voiceTimer = window.setTimeout(() => {
        voiceoverRef.current = playVoiceoverLine({
          text: scene.voiceover,
          audioSrc: scene.voiceoverSrc,
          volume: voiceoverVolume,
          rate: 0.78,
          pitch: 1.36,
          onEnd: () => {
            voiceoverFinished = true;
            advance();
          }
        });
      }, 550);

      return () => {
        window.clearTimeout(voiceTimer);
        window.clearInterval(progressInterval);
        window.clearTimeout(minimumTimer);
        window.clearTimeout(forceTimer);
        cancelVoiceover();
      };
    }

    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(forceTimer);
      cancelVoiceover();
    };
  }, [audioTracksEnabled, open, phase, scene.voiceover, scene.voiceoverSrc, sceneIndex]);

  useEffect(() => {
    if (!open || phase !== "patient" || patientBriefShownRef.current) return;
    cancelVoiceover();
    patientBriefShownRef.current = true;
    setPatientBriefVisible(true);
    const timeout = window.setTimeout(() => setPatientBriefVisible(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [open, phase]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!open || !audio || !audioTracksEnabled || phase !== "scenes") return;

    const audioStartKey = `${startedAt ?? "no-start"}`;
    if (audioStartKeyRef.current === audioStartKey && !audio.paused) return;
    audioStartKeyRef.current = audioStartKey;

    const syncAudio = () => {
      syncIntroAudio(audio);
    };

    audio.loop = false;
    audio.currentTime = Math.min(durationMs, getSyncedElapsed()) / 1000;
    syncAudio();
    playSyncedIntroAudio();

    const interval = window.setInterval(syncAudio, 250);
    return () => {
      window.clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
      audioStartKeyRef.current = "";
      audioRetryNeededRef.current = false;
    };
  }, [audioTracksEnabled, open, phase, startedAt]);

  useEffect(() => {
    if (!open || !audioTracksEnabled || phase !== "scenes") return;
    const retry = () => {
      if (audioRetryNeededRef.current) playSyncedIntroAudio();
    };
    window.addEventListener("pointerdown", retry);
    window.addEventListener("keydown", retry);
    window.addEventListener("touchstart", retry);
    return () => {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
      window.removeEventListener("touchstart", retry);
    };
  }, [audioTracksEnabled, open, phase, startedAt]);

  function skipIntro() {
    if (canSkip) {
      cancelVoiceover();
      onSkip?.();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] overflow-hidden bg-[#050607] text-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_62%_28%,rgba(110,247,255,0.17),transparent_34%),radial-gradient(circle_at_22%_76%,rgba(255,48,77,0.12),transparent_30%)]"
            animate={{ scale: [1, 1.035, 1], opacity: [0.88, 1, 0.88] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.025)_50%)] bg-[length:100%_4px]" />

          {phase === "patient" ? (
            <>
              <PatientCaseReview
                role={role}
                audioEffectsEnabled={audioEffectsEnabled}
                audioTracksEnabled={audioTracksEnabled}
                reviewedFileIds={patientReviewReviewedFileIds ?? []}
                activeFileId={patientReviewActiveFileId}
                onOpenFile={(fileId) => onReviewPatientFile?.(fileId)}
                onContinue={onClose}
                isClosing={isClosing}
              />
              <PhaseBrief
                visible={patientBriefVisible}
                label="Next phase"
                title="Patient Intel"
                subtitle="Review all seven patient files before entering the first station."
              />
            </>
          ) : (
            <div className="relative grid h-screen grid-rows-[auto_1fr_auto] p-4 md:p-6">
              <PhaseBrief
                visible={elapsed < 2400}
                label="Starting"
                title="Briefing"
                subtitle="A short briefing prepares everyone for the patient case and station flow."
              />
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    key={sceneIndex}
                    initial={{ scale: 0.7, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.38, ease: "easeOut" }}
                    className="grid h-14 w-14 place-items-center rounded-md border border-scrub/30 bg-scrub/10 text-scrub"
                  >
                    <SceneIcon className="h-7 w-7" />
                  </motion.div>
                  <div>
                    <div className="font-display text-xs font-black uppercase tracking-[0.24em] text-scrub">Simulation briefing</div>
                    <div className="mt-1 font-display text-2xl font-black uppercase text-white md:text-4xl">Scene {sceneIndex + 1} / 6</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-md border border-white/10 bg-white/[0.045] px-4 py-3 text-right">
                    <div className="font-display text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Patient details in</div>
                    <div className="font-display text-3xl font-black text-monitor">{secondsLeft}s</div>
                  </div>
                </div>
              </header>

              <main className="grid min-h-0 gap-6 py-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(520px,0.75fr)]">
                <AnimatePresence mode="wait">
                  <motion.section
                    key={scene.title}
                    initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                    transition={{ duration: 0.48, ease: "easeOut" }}
                    className="grid min-h-full content-center rounded-md border border-white/10 bg-black/35 p-8 shadow-[0_26px_80px_rgba(0,0,0,0.42)] md:p-12"
                  >
                    <motion.h2
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16, duration: 0.45 }}
                      className="max-w-5xl font-display text-6xl font-black uppercase leading-[0.9] md:text-8xl"
                    >
                      {scene.title}
                    </motion.h2>
                    <div className="mt-10 grid gap-6">
                      {scene.lines.map((line, index) => (
                        <motion.p
                          key={line}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.28 + index * 0.12, duration: 0.42 }}
                          className="max-w-5xl text-4xl font-semibold leading-[3rem] text-white/88 md:text-5xl md:leading-[4rem]"
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>
                  </motion.section>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.aside
                    key={`${scene.title}-visual`}
                    initial={{ opacity: 0, scale: 0.96, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96, x: -20 }}
                    transition={{ duration: 0.48, ease: "easeOut" }}
                    className="grid min-h-0 content-center"
                  >
                    <SceneVisual scene={scene} />
                  </motion.aside>
                </AnimatePresence>
              </main>

              <footer className="grid gap-3 border-t border-white/10 pt-4">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-trauma via-monitor to-scrub" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-display text-xs font-black uppercase tracking-[0.16em] text-white/45">
                    Scene progress {Math.round(sceneProgress)} percent - synced to room clock
                  </div>
                  {canSkip ? (
                    <AnimatedButton variant="ghost" onClick={skipIntro}>
                      Skip to patient details
                    </AnimatedButton>
                  ) : (
                    <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-display text-xs font-black uppercase tracking-[0.14em] text-white/42">
                      Briefing in progress
                    </div>
                  )}
                </div>
              </footer>
            </div>
          )}
          <audio ref={audioRef} src={introAudioSrc} preload="auto" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
