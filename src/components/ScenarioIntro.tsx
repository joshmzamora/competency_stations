import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Circle,
  Gauge,
  HeartPulse,
  Monitor,
  Radio,
  Stethoscope,
  Square,
  Star,
  Triangle,
  Umbrella,
  Volume2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedButton } from "./AnimatedButton";
import { PatientCaseReview } from "./PatientCaseReview";

const durationMs = 45000;
const sceneMs = durationMs / 6;
const fadeOutMs = 6000;
const maxIntroVolume = 0.72;
const introAudioSrc = "/audio/squid_game_intro.mp3";

type IntroScene = {
  eyebrow: string;
  title: string;
  lines: string[];
  purpose: string;
  image?: string;
  visual: "video" | "manikin" | "monitor" | "shapes" | "bedside" | "launch";
  Icon: typeof HeartPulse;
};

const scenes: IntroScene[] = [
  {
    eyebrow: "Watch Video / Simulation Briefing",
    title: "Simulation Briefing",
    lines: ["Watch the simulation and debriefing video first.", "High fidelity simulation begins now."],
    purpose: "Start the scenario with a shared frame before patient details are revealed.",
    image: "/images/intro/medical-mannequin.webp",
    visual: "video",
    Icon: Radio
  },
  {
    eyebrow: "High Fidelity Manikin",
    title: "Realistic Patient Encounter",
    lines: ["The manikin breathes, has a pulse, talks, and has heart sounds.", "Assess him like a real patient."],
    purpose: "The manikin is interactive. Assessment should be physical, verbal, and realistic.",
    image: "/images/intro/human-patient-simulation.jpg",
    visual: "manikin",
    Icon: Stethoscope
  },
  {
    eyebrow: "Monitor Awareness",
    title: "Watch The Monitor",
    lines: ["Vital signs and EKG will be on the monitor.", "Pay attention. ICU changes can happen fast."],
    purpose: "Monitor data is part of the scenario, not background decoration.",
    image: "/images/intro/icu-monitor-front.jpg",
    visual: "monitor",
    Icon: Monitor
  },
  {
    eyebrow: "Shape And Number Assignment",
    title: "Randomized Question Calls",
    lines: ["Each participant receives a shape and number.", "Your shape and number correspond to random questions."],
    purpose: "This prepares learners for the fair selection sequence after the briefing.",
    visual: "shapes",
    Icon: Activity
  },
  {
    eyebrow: "Bedside Orientation",
    title: "Orient To The Patient",
    lines: ["Before we proceed, familiarize yourself with the manikin.", "Feel his pulse. Auscultate heart and lung sounds. Speak to him."],
    purpose: "Learners should touch, listen, and communicate before the scenario accelerates.",
    image: "/images/intro/checking-vital-signs.jpg",
    visual: "bedside",
    Icon: HeartPulse
  },
  {
    eyebrow: "Scenario Launch",
    title: "Stand By",
    lines: ["Simulation briefing complete.", "Stand by for patient details.", "Let's get started."],
    purpose: "The briefing ends here. Patient chart review comes next.",
    image: "/images/intro/vital-signs-monitor.jpg",
    visual: "launch",
    Icon: Gauge
  }
];

function MonitorWave({ color = "#24f5c7", compact = false }: { color?: string; compact?: boolean }) {
  return (
    <svg viewBox="0 0 720 160" className="h-full w-full" aria-hidden="true">
      <rect width="720" height="160" rx="18" fill="#061011" stroke="rgba(110,247,255,.18)" />
      {Array.from({ length: 13 }).map((_, index) => (
        <line key={`v-${index}`} x1={index * 60} x2={index * 60} y1="0" y2="160" stroke="rgba(110,247,255,.06)" />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <line key={`h-${index}`} x1="0" x2="720" y1={index * 40} y2={index * 40} stroke="rgba(110,247,255,.06)" />
      ))}
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0.45 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: compact ? 2.2 : 3.4, repeat: Infinity, ease: "linear" }}
        fill="none"
        stroke={color}
        strokeWidth={compact ? "4" : "5"}
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,82 60,82 74,46 92,122 112,82 172,82 190,66 210,100 232,82 315,82 333,26 355,136 378,82 455,82 474,64 496,101 520,82 720,82"
      />
    </svg>
  );
}

function ShapeConstellation() {
  const shapeItems = [
    { label: "Triangle", Icon: Triangle, tone: "text-trauma", delay: 0 },
    { label: "Star", Icon: Star, tone: "text-amber", delay: 0.12 },
    { label: "Umbrella", Icon: Umbrella, tone: "text-white", delay: 0.24 },
    { label: "Circle", Icon: Circle, tone: "text-scrub", delay: 0.36 },
    { label: "Square", Icon: Square, tone: "text-monitor", delay: 0.48 }
  ];

  return (
    <div className="grid h-full min-h-[360px] place-items-center rounded-md border border-white/10 bg-[#08090b] p-6">
      <div className="grid w-full max-w-xl grid-cols-5 gap-3">
        {shapeItems.map(({ label, Icon, tone, delay }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 28, rotate: -8 }}
            animate={{ opacity: 1, y: index % 2 ? 24 : 0, rotate: 0 }}
            transition={{ delay, duration: 0.55, ease: "easeOut" }}
            className="grid aspect-[0.74] place-items-center rounded-md border border-white/10 bg-white/[0.04]"
          >
            <Icon className={`h-11 w-11 ${tone}`} strokeWidth={1.8} />
            <div className="font-display text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{index + 1}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SceneVisual({ scene }: { scene: IntroScene }) {
  if (scene.visual === "shapes") return <ShapeConstellation />;

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-md border border-white/10 bg-[#090d10] shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
      {scene.image ? (
        <motion.img
          key={scene.image}
          src={scene.image}
          alt=""
          className="h-full min-h-[360px] w-full object-cover"
          initial={{ scale: 1.09, opacity: 0 }}
          animate={{ scale: 1.01, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050607] via-[#050607]/22 to-transparent" />
      <motion.div
        className="absolute inset-x-5 bottom-5 overflow-hidden rounded-md border border-monitor/20 bg-black/72 p-3 backdrop-blur-md"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-monitor">Live monitor strip</div>
          <div className="font-display text-[10px] font-black uppercase tracking-[0.16em] text-trauma">ICU watch</div>
        </div>
        <div className="h-20">
          <MonitorWave compact color={scene.visual === "launch" ? "#ff304d" : "#24f5c7"} />
        </div>
      </motion.div>
    </div>
  );
}

export function ScenarioIntro({
  open,
  onClose,
  onSkip,
  canSkip = false,
  role,
  startedAt,
  serverTime
}: {
  open: boolean;
  onClose: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  role: "host" | "player";
  startedAt?: number | null;
  serverTime?: number;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<"scenes" | "patient">("scenes");
  const [audioBlocked, setAudioBlocked] = useState(false);
  const offsetRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sceneIndex = Math.min(scenes.length - 1, Math.floor(elapsed / sceneMs));
  const scene = scenes[sceneIndex];
  const SceneIcon = scene.Icon;
  const secondsLeft = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
  const progress = Math.min(100, (elapsed / durationMs) * 100);
  const sceneProgress = Math.min(100, ((elapsed - sceneIndex * sceneMs) / sceneMs) * 100);

  useEffect(() => {
    if (!open) return;
    offsetRef.current = serverTime ? Date.now() - serverTime : 0;
    const getElapsed = () => (startedAt ? Math.max(0, Date.now() - offsetRef.current - startedAt) : 0);
    const initialElapsed = Math.min(durationMs, getElapsed());
    setElapsed(initialElapsed);
    setPhase(initialElapsed >= durationMs ? "patient" : "scenes");
    const interval = window.setInterval(() => {
      const next = getElapsed();
      if (next >= durationMs) {
        setElapsed(durationMs);
        setPhase("patient");
        window.clearInterval(interval);
      } else {
        setElapsed(next);
      }
    }, 120);
    return () => window.clearInterval(interval);
  }, [open, serverTime, startedAt]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!open || !audio || phase !== "scenes") return;

    const getElapsed = () => (startedAt ? Math.max(0, Date.now() - offsetRef.current - startedAt) : 0);
    const syncAudio = () => {
      const syncedElapsed = Math.min(durationMs, getElapsed());
      const targetTime = syncedElapsed / 1000;
      const remaining = Math.max(0, durationMs - syncedElapsed);
      audio.volume = Math.min(maxIntroVolume, maxIntroVolume * (remaining / fadeOutMs));
      if (Number.isFinite(targetTime) && Math.abs(audio.currentTime - targetTime) > 0.45) {
        audio.currentTime = targetTime;
      }
    };

    audio.loop = false;
    syncAudio();
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    }

    const interval = window.setInterval(syncAudio, 250);
    return () => {
      window.clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [open, phase, serverTime, startedAt]);

  function enableAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    const targetTime = Math.min(durationMs, startedAt ? Math.max(0, Date.now() - offsetRef.current - startedAt) : elapsed) / 1000;
    audio.currentTime = targetTime;
    audio.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
  }

  function skipIntro() {
    if (canSkip) {
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
            <PatientCaseReview role={role} onContinue={onClose} />
          ) : (
            <div className="relative grid h-screen grid-rows-[auto_1fr_auto] p-4 md:p-6">
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
                  {audioBlocked && (
                    <AnimatedButton variant="secondary" onClick={enableAudio}>
                      <Volume2 className="h-4 w-4" />
                      Enable audio
                    </AnimatedButton>
                  )}
                </div>
              </header>

              <main className="grid min-h-0 gap-6 py-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
                <AnimatePresence mode="wait">
                  <motion.section
                    key={scene.title}
                    initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                    transition={{ duration: 0.48, ease: "easeOut" }}
                    className="grid content-center rounded-md border border-white/10 bg-black/35 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.42)] md:p-10"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08, duration: 0.35 }}
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-monitor/25 bg-monitor/10 px-4 py-2 font-display text-xs font-black uppercase tracking-[0.18em] text-monitor"
                    >
                      {scene.eyebrow}
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16, duration: 0.45 }}
                      className="mt-7 max-w-5xl font-display text-5xl font-black uppercase leading-[0.92] md:text-7xl"
                    >
                      {scene.title}
                    </motion.h2>
                    <div className="mt-7 grid gap-3">
                      {scene.lines.map((line, index) => (
                        <motion.p
                          key={line}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.28 + index * 0.12, duration: 0.42 }}
                          className="max-w-4xl text-2xl font-semibold leading-9 text-white/84 md:text-3xl md:leading-[2.8rem]"
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.54, duration: 0.42 }}
                      className="mt-8 rounded-md border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-white/38">Clinical cue</div>
                      <div className="mt-2 text-lg font-semibold leading-7 text-white/72">{scene.purpose}</div>
                    </motion.div>
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
                      Intro controlled by host
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
