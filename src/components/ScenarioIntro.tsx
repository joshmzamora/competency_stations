import { AnimatePresence, motion } from "framer-motion";
import { Activity, HeartPulse, Monitor, Radio, Stethoscope, UserRound, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedButton } from "./AnimatedButton";

const durationMs = 45000;
const slideMs = 7500;
const fadeOutMs = 6000;
const maxIntroVolume = 0.72;
const introAudioSrc = "/audio/squid_game_intro.mp3";

type VoiceCue = {
  say: string;
  do: string;
  watch: string;
};

const slides: Array<{
  kicker: string;
  title: string;
  body: string;
  bullets: string[];
  cue: VoiceCue;
  icon: typeof HeartPulse;
  visual: "manikin" | "bedside" | "identity" | "history" | "report" | "launch";
}> = [
  {
    kicker: "00:00 / Simulation boot",
    title: "High Fidelity Environment",
    body: "The manikin breathes, has a pulse, talks, and has heart sounds. This is a real ICU-style assessment, not a worksheet.",
    bullets: ["Breathing manikin", "Palpable pulse", "Heart sounds", "Voice-enabled patient"],
    cue: {
      say: "Welcome to the high-fidelity simulation. Treat Emma exactly like a real ICU patient.",
      do: "Point out the monitor, manikin, oxygen setup, and available assessment equipment.",
      watch: "Learner should visually orient to the patient before touching equipment."
    },
    icon: HeartPulse,
    visual: "manikin"
  },
  {
    kicker: "00:10 / Bedside familiarization",
    title: "Assess Before You Act",
    body: "Before we proceed, familiarize yourself with the manikin. Feel the pulse, auscultate heart and lung sounds, and remember that she can talk.",
    bullets: ["Feel pulse", "Auscultate heart", "Auscultate lungs", "Listen to patient speech"],
    cue: {
      say: "Take a moment to assess the patient. Feel a pulse and listen before the scenario accelerates.",
      do: "Give the learner time to physically assess the manikin.",
      watch: "Learner should use hands-on assessment, not only monitor data."
    },
    icon: Stethoscope,
    visual: "bedside"
  },
  {
    kicker: "00:20 / Patient identification",
    title: "Emma Gonnadye",
    body: "67-year-old female, 90 kg, admitted with acute exacerbation of congestive heart failure, EF 20%, COPD, and chronic atrial fibrillation.",
    bullets: ["Age 67", "Weight 90 kg", "EF 20%", "COPD and chronic AFib"],
    cue: {
      say: "Your patient is Emma Gonnadye. Confirm the identity and hold the diagnosis in mind.",
      do: "Emphasize EF 20%, COPD, chronic atrial fibrillation, and anticoagulation risk.",
      watch: "Learner should connect diagnosis to perfusion, respiratory status, and rhythm risk."
    },
    icon: UserRound,
    visual: "identity"
  },
  {
    kicker: "00:30 / Present illness",
    title: "Shortness of Breath at Rest",
    body: "Emma came to the emergency department with several days of worsening shortness of breath and cough. She started with exertional symptoms and now has dyspnea at rest.",
    bullets: ["Symptoms worsening", "Cough for several days", "SOB now at rest", "High-risk cardiac history"],
    cue: {
      say: "This is a worsening presentation. She is not stable just because she is awake and talking.",
      do: "Call attention to the change from exertional SOB to SOB at rest.",
      watch: "Learner should anticipate rapid deterioration and reassess frequently."
    },
    icon: Activity,
    visual: "history"
  },
  {
    kicker: "00:40 / From report",
    title: "The Clues Are Already There",
    body: "Awake and oriented, atrial fibrillation on monitor, crackles bilaterally, 3+ pitting edema BLE, and blood glucose 460 mg/dL.",
    bullets: ["AFib on EKG", "Bilateral crackles", "3+ BLE edema", "Glucose 460"],
    cue: {
      say: "Report gives you the pattern: rhythm issue, fluid overload, respiratory compromise, and severe hyperglycemia.",
      do: "Let the learner scan the monitor and report data.",
      watch: "Learner should notice both cardiac and respiratory concerns."
    },
    icon: Monitor,
    visual: "report"
  },
  {
    kicker: "00:50 / Scenario start",
    title: "Monitor Closely",
    body: "Vital signs and EKG are on the monitor. Pay attention because, like a real ICU patient, they can change fast. Let us get started.",
    bullets: ["Vitals may change", "EKG visible", "Use team communication", "Begin station flow"],
    cue: {
      say: "The monitor is live. Communicate clearly, reassess often, and begin the first station.",
      do: "Pause for the learner to look at the monitor, then transition into the active station.",
      watch: "Learner should verbalize assessment priorities before the first intervention."
    },
    icon: Radio,
    visual: "launch"
  }
];

const profile = [
  ["Patient", "Emma Gonnadye"],
  ["Age", "67"],
  ["Gender", "Female"],
  ["Weight", "90 kg"],
  ["Diagnosis", "CHF exacerbation, EF 20%, COPD, chronic atrial fibrillation"],
  ["Chief complaint", "Worsening shortness of breath and cough"]
];

const medications = ["Insulin glargine 20 units HS", "Furosemide 40 mg daily", "Aspirin 81 mg daily", "Eliquis 5 mg BID", "Carvedilol 25 mg BID"];

const report = [
  ["General", "A&O x4"],
  ["Vital signs", "On monitor"],
  ["Neuro", "Normal"],
  ["Cardiac", "Atrial fibrillation"],
  ["Resp", "Crackles bilaterally"],
  ["PV", "3+ pitting edema BLE"],
  ["Abdomen", "Soft, non-tender"],
  ["EKG", "Atrial fibrillation"],
  ["Glucose", "460 mg/dL"]
];

function MonitorWave({ color = "#24f5c7" }: { color?: string }) {
  return (
    <svg viewBox="0 0 520 170" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="waveGlow" x1="0" x2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="520" height="170" rx="14" fill="#06100f" stroke="rgba(36,245,199,.28)" />
      {Array.from({ length: 11 }).map((_, index) => (
        <line key={`v-${index}`} x1={index * 52} x2={index * 52} y1="0" y2="170" stroke="rgba(110,247,255,.08)" />
      ))}
      {Array.from({ length: 6 }).map((_, index) => (
        <line key={`h-${index}`} x1="0" x2="520" y1={index * 34} y2={index * 34} stroke="rgba(110,247,255,.08)" />
      ))}
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.8, repeat: Infinity, repeatType: "loop", ease: "linear" }}
        fill="none"
        stroke="url(#waveGlow)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,86 45,86 58,42 75,128 90,86 135,86 150,62 168,104 188,86 250,86 266,28 286,142 306,86 360,86 374,68 392,100 410,86 520,86"
      />
    </svg>
  );
}

function VisualScene({ type }: { type: (typeof slides)[number]["visual"] }) {
  if (type === "manikin") {
    return (
      <div className="relative h-full min-h-[320px] overflow-hidden rounded-md bg-[#071013] p-5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(36,245,199,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(36,245,199,.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <motion.div
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 h-64 w-44 -translate-x-1/2 rounded-t-full border border-monitor/30 bg-[#111b20] shadow-scrub"
        >
          <div className="absolute left-1/2 top-8 h-20 w-20 -translate-x-1/2 rounded-full border border-white/15 bg-[#202b31]" />
          <div className="absolute left-1/2 top-32 h-24 w-28 -translate-x-1/2 rounded-[40%] border border-scrub/25 bg-[#18252a]" />
          <motion.div
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.98, 1.06, 0.98] }}
            transition={{ duration: 1.1, repeat: Infinity }}
            className="absolute left-1/2 top-40 h-8 w-8 -translate-x-1/2 rounded-full bg-trauma/80 shadow-alert"
          />
        </motion.div>
        <div className="absolute right-5 top-5 h-28 w-56">
          <MonitorWave />
        </div>
      </div>
    );
  }

  if (type === "bedside") {
    return (
      <div className="grid h-full min-h-[320px] gap-4 rounded-md bg-[#081014] p-5">
        <div className="grid grid-cols-3 gap-3">
          {["Pulse", "Heart", "Lungs"].map((label, index) => (
            <motion.div
              key={label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.18 }}
              className="rounded-md border border-scrub/25 bg-scrub/10 p-4 text-center"
            >
              <Stethoscope className="mx-auto h-8 w-8 text-scrub" />
              <div className="mt-3 font-display text-xl font-black uppercase">{label}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">Assess</div>
            </motion.div>
          ))}
        </div>
        <div className="rounded-md border border-monitor/20 bg-monitor/10 p-5">
          <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-monitor">Hands-on orientation</div>
          <div className="mt-3 text-3xl font-black uppercase leading-tight">Do not skip the patient because the monitor is loud.</div>
        </div>
      </div>
    );
  }

  if (type === "identity") {
    return (
      <div className="grid h-full min-h-[320px] content-center gap-4 rounded-md bg-[#0b1016] p-6">
        <div className="rounded-md border border-white/15 bg-white/[0.06] p-5">
          <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white/45">Patient wristband</div>
          <div className="mt-4 font-display text-5xl font-black uppercase">Emma Gonnadye</div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {["67 years", "Female", "90 kg"].map((item) => (
              <div key={item} className="rounded-md bg-scrub/10 p-3 text-center font-display text-xl font-bold text-scrub">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-trauma/30 bg-trauma/10 p-4 font-display text-2xl font-black uppercase text-white">
          EF 20% + COPD + Chronic AFib
        </div>
      </div>
    );
  }

  if (type === "history") {
    return (
      <div className="grid h-full min-h-[320px] rounded-md bg-[#080d13] p-5">
        <div className="relative overflow-hidden rounded-md border border-white/10 bg-[#111820] p-5">
          <div className="absolute bottom-0 left-8 top-0 w-1 bg-gradient-to-b from-scrub via-monitor to-trauma" />
          {["SOB with exertion", "Cough for days", "SOB at rest", "ICU deterioration risk"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.16 }}
              className="ml-10 mt-4 rounded-md border border-white/10 bg-white/[0.045] p-4 first:mt-0"
            >
              <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-monitor">Phase {index + 1}</div>
              <div className="mt-1 text-2xl font-black uppercase">{item}</div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "report") {
    return (
      <div className="grid h-full min-h-[320px] gap-4 rounded-md bg-[#07100f] p-5">
        <div className="h-36">
          <MonitorWave color="#ff304d" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["AFib", "Crackles", "3+ edema", "BG 460"].map((item, index) => (
            <motion.div
              key={item}
              animate={{ borderColor: index === 3 ? ["rgba(255,48,77,.3)", "rgba(255,48,77,1)", "rgba(255,48,77,.3)"] : undefined }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="rounded-md border border-white/10 bg-white/[0.05] p-4 text-center font-display text-3xl font-black uppercase"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid h-full min-h-[320px] place-items-center overflow-hidden rounded-md bg-[#080b0f] p-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute h-72 w-72 rounded-full border border-dashed border-scrub/45"
      />
      <motion.div
        animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="grid h-48 w-48 place-items-center rounded-full border border-trauma/50 bg-trauma/10 shadow-alert"
      >
        <Radio className="h-20 w-20 text-trauma" />
      </motion.div>
      <div className="absolute bottom-8 font-display text-4xl font-black uppercase tracking-[0.18em]">Begin</div>
    </div>
  );
}

export function ScenarioIntro({
  open,
  onClose,
  role,
  startedAt,
  serverTime
}: {
  open: boolean;
  onClose: () => void;
  role: "host" | "player";
  startedAt?: number | null;
  serverTime?: number;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const offsetRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slideIndex = Math.min(slides.length - 1, Math.floor(elapsed / slideMs));
  const slide = slides[slideIndex];
  const Icon = slide.icon;
  const secondsLeft = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
  const progress = Math.min(100, (elapsed / durationMs) * 100);
  const slideProgress = Math.min(100, ((elapsed - slideIndex * slideMs) / slideMs) * 100);

  useEffect(() => {
    if (!open) return;
    offsetRef.current = serverTime ? Date.now() - serverTime : 0;
    const getElapsed = () => (startedAt ? Math.max(0, Date.now() - offsetRef.current - startedAt) : 0);
    setElapsed(getElapsed());
    const interval = window.setInterval(() => {
      const next = getElapsed();
      if (next >= durationMs) {
        setElapsed(durationMs);
        window.clearInterval(interval);
        onClose();
      } else {
        setElapsed(next);
      }
    }, 120);
    return () => window.clearInterval(interval);
  }, [onClose, open, serverTime, startedAt]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!open || !audio) return;

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
      playPromise
        .then(() => setAudioBlocked(false))
        .catch(() => setAudioBlocked(true));
    }

    const interval = window.setInterval(syncAudio, 250);
    return () => {
      window.clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [open, serverTime, startedAt]);

  function enableAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    const targetTime = Math.min(durationMs, startedAt ? Math.max(0, Date.now() - offsetRef.current - startedAt) : elapsed) / 1000;
    audio.currentTime = targetTime;
    audio
      .play()
      .then(() => setAudioBlocked(false))
      .catch(() => setAudioBlocked(true));
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] overflow-hidden bg-[#05070a] text-white"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(36,245,199,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,48,77,0.06)_1px,transparent_1px)] bg-[size:38px_38px]" />
            <div className="absolute inset-x-0 top-0 h-2/3 animate-scan bg-gradient-to-b from-transparent via-monitor/10 to-transparent" />
          </div>

          <div className="relative grid h-screen grid-rows-[auto_1fr_auto] p-4 md:p-6">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#05070a] pb-4">
              <div>
                <div className="font-display text-xs font-bold uppercase tracking-[0.24em] text-trauma">45 second simulation launch</div>
                <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none md:text-6xl">Emma Gonnadye Briefing</h2>
              </div>
              <div className="rounded-md border border-scrub/30 bg-[#071713] px-4 py-3 text-right">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Auto start in</div>
                <div className="font-display text-3xl font-black text-scrub">{secondsLeft}s</div>
              </div>
              {audioBlocked && (
                <AnimatedButton variant="secondary" onClick={enableAudio}>
                  <Volume2 className="h-4 w-4" />
                  Enable audio
                </AnimatedButton>
              )}
            </header>

            <main className="grid min-h-0 gap-5 py-5 xl:grid-cols-[1fr_430px]">
              <section className="relative grid min-h-0 gap-4 overflow-hidden rounded-md border border-scrub/25 bg-[#081014] p-5 shadow-scrub lg:grid-cols-[1.05fr_0.95fr]">
                <motion.div
                  key={slide.title}
                  initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="grid h-full content-between gap-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-monitor">{slide.kicker}</div>
                      <div className="grid h-16 w-16 place-items-center rounded-md border border-trauma/45 bg-[#1d0b10] shadow-alert">
                        <Icon className="h-8 w-8 text-trauma" />
                      </div>
                    </div>
                    <h3 className="mt-7 max-w-5xl font-display text-5xl font-black uppercase leading-[0.92] md:text-7xl">{slide.title}</h3>
                    <p className="mt-6 max-w-4xl text-2xl leading-10 text-white/82">{slide.body}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {slide.bullets.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 + index * 0.08 }}
                        className="rounded-md border border-white/10 bg-[#101820] p-4"
                      >
                        <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-scrub">Data point {index + 1}</div>
                        <div className="mt-2 text-lg font-semibold text-white">{item}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <VisualScene type={slide.visual} />
                <div className="absolute bottom-0 left-0 h-1 bg-scrub shadow-scrub" style={{ width: `${slideProgress}%` }} />
              </section>

              <aside className="grid min-h-0 content-start gap-4 overflow-y-auto">
                {role === "host" && (
                  <div className="rounded-md border border-amber/40 bg-[#1a1304] p-4">
                    <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-amber">Host voiceover script</div>
                    <div className="mt-4 grid gap-3">
                      <div>
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Say</div>
                        <p className="mt-1 text-base leading-6 text-white/86">{slide.cue.say}</p>
                      </div>
                      <div>
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Do</div>
                        <p className="mt-1 text-sm leading-6 text-white/72">{slide.cue.do}</p>
                      </div>
                      <div>
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Watch for</div>
                        <p className="mt-1 text-sm leading-6 text-white/72">{slide.cue.watch}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-md border border-white/10 bg-[#0b1118] p-4">
                  <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Patient card</div>
                  <div className="mt-3 grid gap-2">
                    {profile.map(([label, value]) => (
                      <div key={label} className="rounded-md border border-white/10 bg-[#111a22] p-3">
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{label}</div>
                        <div className="mt-1 text-sm font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-white/10 bg-[#0b1118] p-4">
                  <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Report snapshot</div>
                  <div className="mt-3 grid gap-2">
                    {report.map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-3 border-b border-white/10 pb-2 last:border-b-0">
                        <span className="font-display text-xs font-bold uppercase tracking-[0.12em] text-white/45">{label}</span>
                        <span className="text-right text-sm text-white/78">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-trauma/25 bg-[#19090d] p-4">
                  <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-trauma">Medication flags</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {medications.map((med) => (
                      <span key={med} className="rounded-sm border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white/75">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </main>

            <footer className="grid gap-3 border-t border-white/10 bg-[#05070a] pt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-trauma via-monitor to-scrub" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                  Slide {slideIndex + 1} of {slides.length} - synced local audio and visual playback
                </div>
                <AnimatedButton variant="ghost" onClick={onClose}>
                  Skip intro
                </AnimatedButton>
              </div>
            </footer>
          </div>
          <audio ref={audioRef} src={introAudioSrc} preload="auto" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
