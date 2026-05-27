import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, ClipboardCheck, Gauge, HeartPulse, Monitor, Radio, Stethoscope, UserRound, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedButton } from "./AnimatedButton";

const durationMs = 45000;
const slideMs = 7500;
const fadeOutMs = 6000;
const maxIntroVolume = 0.72;
const introAudioSrc = "/audio/squid_game_intro.mp3";

type FacilitatorCue = {
  readAloud: string;
  pointOut: string;
  note: string;
};

type DataPoint = {
  label: string;
  value: string;
  tone?: "default" | "alert" | "stable";
};

type IntroSlide = {
  kicker: string;
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
  icon: typeof HeartPulse;
  cue: FacilitatorCue;
  focus: string[];
  data: DataPoint[];
};

const slides: IntroSlide[] = [
  {
    kicker: "Simulation Setup",
    title: "High Fidelity Patient Encounter",
    subtitle: "The manikin breathes, has a pulse, talks, and has heart sounds. Assess Emma like you would assess a real ICU patient.",
    image: "/images/intro/simulation-manikin.jpg",
    imageAlt: "Clinical staff using a high fidelity simulation manikin",
    icon: HeartPulse,
    cue: {
      readAloud:
        "Welcome to the high-fidelity simulation. Emma should be treated like a real ICU patient from the first assessment through the final handoff.",
      pointOut: "Orient the learner to the manikin, monitor, oxygen setup, and bedside assessment tools.",
      note: "Give them a few seconds to physically look around before the scenario begins."
    },
    focus: ["Breathing manikin", "Palpable pulses", "Heart and lung sounds", "Patient can speak"],
    data: [
      { label: "Environment", value: "High fidelity simulation", tone: "stable" },
      { label: "Learner expectation", value: "Assess first, then act" },
      { label: "Scenario style", value: "Real-time ICU checkoff" }
    ]
  },
  {
    kicker: "Bedside Orientation",
    title: "Start With The Patient",
    subtitle: "Before the clinical problem accelerates, the learner should feel a pulse, auscultate heart and lung sounds, and speak to Emma.",
    image: "/images/intro/simulation-manikin.jpg",
    imageAlt: "Simulation manikin being assessed with a stethoscope",
    icon: Stethoscope,
    cue: {
      readAloud:
        "Before we begin, take a moment to treat Emma like a real ICU patient. Feel for a pulse, listen to heart and lung sounds, and orient yourself to the monitor.",
      pointOut: "Invite the learner to touch the patient and listen, not just read the screen.",
      note: "This is a useful pause for calm, realistic setup before the questions begin."
    },
    focus: ["Feel pulse", "Auscultate heart", "Auscultate lungs", "Ask patient questions"],
    data: [
      { label: "General", value: "Awake, alert, oriented x4", tone: "stable" },
      { label: "Neuro", value: "Normal" },
      { label: "Respiratory", value: "Crackles bilaterally", tone: "alert" }
    ]
  },
  {
    kicker: "Patient Identity",
    title: "Emma Gonnadye",
    subtitle: "67-year-old female, 90 kg, admitted with acute exacerbation of congestive heart failure, COPD, and chronic atrial fibrillation.",
    icon: UserRound,
    cue: {
      readAloud:
        "Your patient is Emma Gonnadye. Keep her heart failure, COPD, chronic atrial fibrillation, and anticoagulation risk in mind as you assess her.",
      pointOut: "Call attention to EF 20 percent and the rhythm history.",
      note: "The goal is to connect the patient story to perfusion, breathing, and escalation decisions."
    },
    focus: ["Age 67", "Female", "90 kg", "EF 20 percent"],
    data: [
      { label: "Diagnosis", value: "CHF exacerbation, EF 20 percent", tone: "alert" },
      { label: "Comorbidities", value: "COPD, chronic AFib" },
      { label: "Chief complaint", value: "Worsening shortness of breath and cough" }
    ]
  },
  {
    kicker: "History Of Present Illness",
    title: "Shortness Of Breath At Rest",
    subtitle: "Emma had several days of worsening shortness of breath and cough. Symptoms began with exertion and are now present at rest.",
    icon: Activity,
    cue: {
      readAloud:
        "Emma was brought to the emergency department after shortness of breath and cough worsened over several days. She is now short of breath at rest.",
      pointOut: "Emphasize that worsening from exertional symptoms to rest symptoms is a deterioration clue.",
      note: "Learners should anticipate frequent reassessment, not one-and-done vital signs."
    },
    focus: ["Symptoms worsening", "Cough for days", "SOB at rest", "Rapid change risk"],
    data: [
      { label: "Cardiac history", value: "Hypertension, CAD with stent, chronic AFib" },
      { label: "Metabolic history", value: "Diabetes, CKD stage III" },
      { label: "Current risk", value: "Can deteriorate quickly", tone: "alert" }
    ]
  },
  {
    kicker: "Report Snapshot",
    title: "Read The Pattern",
    subtitle: "Atrial fibrillation, bilateral crackles, 3+ pitting edema, and glucose 460 mg/dL point toward a complex cardiac and respiratory presentation.",
    image: "/images/intro/code-blue-control.jpg",
    imageAlt: "Simulation control laptop beside a mannequin during a mock code drill",
    icon: Monitor,
    cue: {
      readAloud:
        "Report is already giving you the pattern: rhythm issue, fluid overload, respiratory compromise, and severe hyperglycemia.",
      pointOut: "Let the learner scan the monitor and report data before moving forward.",
      note: "Listen for them to name both cardiac and respiratory priorities."
    },
    focus: ["AFib on EKG", "Crackles", "3+ BLE edema", "Glucose 460"],
    data: [
      { label: "Cardiovascular", value: "Atrial fibrillation", tone: "alert" },
      { label: "Peripheral vascular", value: "3+ pitting edema BLE", tone: "alert" },
      { label: "Blood glucose", value: "460 mg/dL", tone: "alert" }
    ]
  },
  {
    kicker: "Scenario Launch",
    title: "Monitor Closely",
    subtitle: "Vital signs and EKG are on the monitor. They can change quickly, just like a real ICU patient. Begin when the learner is ready.",
    icon: Radio,
    cue: {
      readAloud:
        "The monitor is live. Communicate clearly, reassess often, and use the information in front of you as the scenario changes.",
      pointOut: "Transition from briefing into the active station flow.",
      note: "This is the handoff moment. Pause briefly, then start the first prompt."
    },
    focus: ["Vitals on monitor", "EKG visible", "Team communication", "Begin station"],
    data: [
      { label: "Monitor", value: "Vitals and EKG visible", tone: "stable" },
      { label: "Expectation", value: "Reassess with changes" },
      { label: "Next step", value: "Start station flow", tone: "stable" }
    ]
  }
];

const profile = [
  ["Patient", "Emma Gonnadye"],
  ["Age", "67"],
  ["Gender", "Female"],
  ["Weight", "90 kg"],
  ["Diagnosis", "Acute CHF exacerbation, EF 20 percent, COPD, chronic atrial fibrillation"],
  ["Chief complaint", "Worsening shortness of breath and cough"]
];

const medications = ["Insulin glargine 20 units HS", "Furosemide 40 mg daily", "Aspirin 81 mg daily", "Eliquis 5 mg BID", "Carvedilol 25 mg BID"];

const report = [
  ["General", "Awake, alert, oriented x4"],
  ["Vital signs", "On monitor"],
  ["Neurological", "Normal"],
  ["Cardiovascular", "Atrial fibrillation"],
  ["Respiratory", "Crackles bilaterally"],
  ["Peripheral vascular", "3+ pitting edema BLE"],
  ["Abdomen", "Soft, non-tender"],
  ["EKG", "Atrial fibrillation"],
  ["Blood glucose", "460 mg/dL"]
];

function MonitorWave({ color = "#24f5c7" }: { color?: string }) {
  return (
    <svg viewBox="0 0 720 160" className="h-full w-full" aria-hidden="true">
      <rect width="720" height="160" rx="16" fill="#07100f" stroke="rgba(36,245,199,.22)" />
      {Array.from({ length: 13 }).map((_, index) => (
        <line key={`v-${index}`} x1={index * 60} x2={index * 60} y1="0" y2="160" stroke="rgba(110,247,255,.06)" />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <line key={`h-${index}`} x1="0" x2="720" y1={index * 40} y2={index * 40} stroke="rgba(110,247,255,.06)" />
      ))}
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0.5 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 3.4, repeat: Infinity, repeatType: "loop", ease: "linear" }}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,82 60,82 74,46 92,122 112,82 172,82 190,66 210,100 232,82 315,82 333,26 355,136 378,82 455,82 474,64 496,101 520,82 720,82"
      />
    </svg>
  );
}

function ClinicalImage({ slide }: { slide: IntroSlide }) {
  if (slide.image) {
    return (
      <div className="relative min-h-[310px] overflow-hidden rounded-md border border-white/10 bg-[#0c1218]">
        <motion.img
          key={slide.image}
          src={slide.image}
          alt={slide.imageAlt ?? ""}
          className="h-full min-h-[310px] w-full object-cover"
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a]/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 rounded-md border border-white/10 bg-[#05070a]/82 p-3 backdrop-blur-md">
          <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-scrub">Simulation lab visual</div>
          <div className="mt-1 text-sm text-white/72">High fidelity patient environment with real-time assessment cues.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[310px] gap-4 rounded-md border border-white/10 bg-[#0b1118] p-4">
      <div className="h-40">
        <MonitorWave color="#6ef7ff" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["HR", "AFib"],
          ["Lungs", "Crackles"],
          ["Edema", "3+ BLE"],
          ["BG", "460"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/[0.045] p-4">
            <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">{label}</div>
            <div className="mt-1 font-display text-2xl font-black uppercase text-white">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function toneClass(tone: DataPoint["tone"]) {
  if (tone === "alert") return "border-trauma/35 bg-trauma/10 text-white";
  if (tone === "stable") return "border-scrub/30 bg-scrub/10 text-white";
  return "border-white/10 bg-white/[0.045] text-white";
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
      playPromise.then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
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
          className="fixed inset-0 z-[60] overflow-hidden bg-[#05070a] text-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#10202a] to-transparent" />

          <div className="relative grid h-screen grid-rows-[auto_1fr_auto] p-4 md:p-6">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#05070a] pb-4">
              <div>
                <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-scrub">45 second simulation briefing</div>
                <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none md:text-5xl">Emma Gonnadye Scenario</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-md border border-white/10 bg-white/[0.045] px-4 py-3 text-right">
                  <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Briefing ends in</div>
                  <div className="font-display text-3xl font-black text-scrub">{secondsLeft}s</div>
                </div>
                {audioBlocked && (
                  <AnimatedButton variant="secondary" onClick={enableAudio}>
                    <Volume2 className="h-4 w-4" />
                    Enable audio
                  </AnimatedButton>
                )}
              </div>
            </header>

            <main className="grid min-h-0 gap-5 py-5 xl:grid-cols-[minmax(0,1fr)_380px]">
              <section className="grid min-h-0 gap-5 overflow-hidden rounded-md border border-white/10 bg-[#080d12] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
                <motion.div
                  key={slide.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.48, ease: "easeOut" }}
                  className="grid content-between gap-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-scrub/10 text-scrub">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white/58">{slide.kicker}</span>
                      </div>
                      <div className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                        Step {slideIndex + 1} / {slides.length}
                      </div>
                    </div>

                    <h3 className="mt-6 max-w-4xl font-display text-4xl font-black uppercase leading-[0.98] md:text-6xl">{slide.title}</h3>
                    <p className="mt-5 max-w-4xl text-xl leading-8 text-white/78">{slide.subtitle}</p>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {slide.focus.map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 + index * 0.05 }}
                          className="rounded-md border border-white/10 bg-white/[0.045] p-3"
                        >
                          <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Assessment cue</div>
                          <div className="mt-1 text-base font-semibold text-white">{item}</div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {slide.data.map((item) => (
                        <div key={`${item.label}-${item.value}`} className={`rounded-md border p-3 ${toneClass(item.tone)}`}>
                          <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">{item.label}</div>
                          <div className="mt-1 text-sm font-semibold leading-5 text-white/88">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <div className="grid gap-4">
                  <ClinicalImage slide={slide} />
                  <div className="overflow-hidden rounded-md border border-white/10 bg-[#091112] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-monitor">
                        <Gauge className="h-4 w-4" />
                        Live monitor reference
                      </div>
                      <div className="text-xs text-white/42">EKG and VS can change quickly</div>
                    </div>
                    <div className="h-24">
                      <MonitorWave />
                    </div>
                  </div>
                </div>
              </section>

              <aside className="grid min-h-0 content-start gap-4 overflow-y-auto">
                {role === "host" && (
                  <div className="rounded-md border border-amber/25 bg-[#151107] p-4">
                    <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-amber">
                      <ClipboardCheck className="h-4 w-4" />
                      Host cue
                    </div>
                    <div className="mt-4 grid gap-4">
                      <div>
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Read aloud</div>
                        <p className="mt-1 text-base leading-6 text-white/88">{slide.cue.readAloud}</p>
                      </div>
                      <div>
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Point out</div>
                        <p className="mt-1 text-sm leading-6 text-white/72">{slide.cue.pointOut}</p>
                      </div>
                      <div>
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Optional facilitator note</div>
                        <p className="mt-1 text-sm leading-6 text-white/72">{slide.cue.note}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-md border border-white/10 bg-[#0b1118] p-4">
                  <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-monitor">
                    <UserRound className="h-4 w-4" />
                    Patient card
                  </div>
                  <div className="mt-3 grid gap-2">
                    {profile.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-white/10 pb-2 last:border-b-0">
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</span>
                        <span className="text-sm font-semibold leading-5 text-white/82">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-white/10 bg-[#0b1118] p-4">
                  <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-monitor">
                    <AlertTriangle className="h-4 w-4" />
                    Report snapshot
                  </div>
                  <div className="mt-3 grid gap-2">
                    {report.map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-4 border-b border-white/10 pb-2 last:border-b-0">
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">{label}</span>
                        <span className="text-right text-sm text-white/78">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-white/10 bg-[#0b1118] p-4">
                  <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-monitor">Medication review</div>
                  <div className="mt-3 grid gap-2">
                    {medications.map((med) => (
                      <div key={med} className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/74">
                        {med}
                      </div>
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
                <div className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                  Slide progress {Math.round(slideProgress)} percent - briefing synced to the room clock
                </div>
                {canSkip ? (
                  <AnimatedButton variant="ghost" onClick={skipIntro}>
                    Skip intro
                  </AnimatedButton>
                ) : (
                  <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/42">
                    Intro controlled by host
                  </div>
                )}
              </div>
            </footer>
          </div>
          <audio ref={audioRef} src={introAudioSrc} preload="auto" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
