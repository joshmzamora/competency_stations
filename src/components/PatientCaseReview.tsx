import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  FileSearch,
  FileText,
  HeartPulse,
  KeyRound,
  Monitor,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserRound
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedButton } from "./AnimatedButton";
import { playFileClickCue } from "../utils/sound";

const caseAudioSrc = "/audio/cinematic_tension.mp3";

type CaseFile = {
  id: string;
  title: string;
  Icon: typeof FileText;
  critical?: string[];
  rows: Array<[string, string]>;
};

const caseFiles: CaseFile[] = [
  {
    id: "identity",
    title: "Patient Identity",
    Icon: UserRound,
    critical: ["EF 20%", "COPD", "Chronic atrial fibrillation"],
    rows: [
      ["Patient Name", "Emma Gonnadye"],
      ["Age", "67"],
      ["Gender", "Female"],
      ["Height", "5'2\""],
      ["Weight", "167 lb (75.7 kg)"],
      ["BMI", "30.5"],
      ["Diagnosis", "Acute exacerbation of congestive heart failure, EF 20%; COPD; chronic atrial fibrillation"]
    ]
  },
  {
    id: "complaint",
    title: "Chief Complaint",
    Icon: Stethoscope,
    rows: [["Chief Complaint", "Worsening shortness of breath and cough over the last couple of days"]]
  },
  {
    id: "hpi",
    title: "HPI",
    Icon: FileSearch,
    critical: ["Shortness of breath at rest"],
    rows: [
      [
        "History of Present Illness",
        "Emma was brought to the emergency department by her husband after complaining of shortness of breath and cough for the last couple of days. Initially, she complained of shortness of breath with exertion, but now complains of shortness of breath at rest."
      ]
    ]
  },
  {
    id: "history",
    title: "Past Medical History",
    Icon: HeartPulse,
    critical: ["Chronic atrial fibrillation"],
    rows: [
      ["History", "Hypertension"],
      ["History", "Diabetes"],
      ["History", "Coronary artery disease with stent"],
      ["History", "CKD stage III"],
      ["History", "Chronic atrial fibrillation"]
    ]
  },
  {
    id: "meds",
    title: "Medications",
    Icon: Pill,
    rows: [
      ["Medication", "Insulin glargine 20 units at bedtime"],
      ["Medication", "Furosemide 40 mg daily"],
      ["Medication", "Aspirin 81 mg daily"],
      ["Medication", "Eliquis 5 mg BID"],
      ["Medication", "Carvedilol 25 mg twice daily"]
    ]
  },
  {
    id: "report",
    title: "Report Snapshot",
    Icon: ClipboardList,
    critical: ["Crackles bilaterally", "3+ pitting edema BLE"],
    rows: [
      ["General", "Awake, alert, and oriented x4"],
      ["Vital Signs", "On the monitor"],
      ["Neurological", "Normal"],
      ["Cardiovascular", "Atrial fibrillation"],
      ["Respiratory", "Crackles bilaterally"],
      ["Peripheral Vascular", "3+ pitting edema BLE"],
      ["Abdomen", "Soft, non-tender"]
    ]
  },
  {
    id: "diagnostics",
    title: "Diagnostics",
    Icon: Monitor,
    critical: ["EKG: atrial fibrillation", "Blood glucose 460 mg/dL"],
    rows: [
      ["EKG", "Atrial fibrillation"],
      ["Blood Glucose", "460 mg/dL"]
    ]
  }
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isCriticalRow(file: CaseFile, label: string, value: string) {
  const haystack = normalize(`${label} ${value}`);
  return (file.critical ?? []).some((clue) => haystack.includes(normalize(clue)) || normalize(clue).includes(haystack));
}

function MonitorStrip() {
  return (
    <svg viewBox="0 0 720 120" className="h-full w-full" aria-hidden="true">
      <rect width="720" height="120" rx="16" fill="#061011" stroke="rgba(110,247,255,.18)" />
      {Array.from({ length: 9 }).map((_, index) => (
        <line key={index} x1={index * 90} x2={index * 90} y1="0" y2="120" stroke="rgba(110,247,255,.05)" />
      ))}
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0.55 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        fill="none"
        stroke="#24f5c7"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,64 70,64 84,38 101,92 120,64 205,64 226,49 245,82 265,64 355,64 375,22 400,104 424,64 520,64 540,48 558,80 580,64 720,64"
      />
    </svg>
  );
}

function CaseFileCard({
  file,
  active,
  reviewed,
  readOnly,
  onOpen
}: {
  file: CaseFile;
  active: boolean;
  reviewed: boolean;
  readOnly: boolean;
  onOpen: () => void;
}) {
  const Icon = file.Icon;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (!readOnly) onOpen();
      }}
      className={`group relative min-h-[210px] overflow-hidden rounded-md border p-6 text-left shadow-[0_18px_44px_rgba(0,0,0,0.28)] transition ${active
        ? "border-scrub/55 bg-[#071817] shadow-[0_0_46px_rgba(34,245,199,0.18)]"
        : reviewed
          ? "border-scrub/35 bg-scrub/[0.075] shadow-[0_0_26px_rgba(34,245,199,0.1)]"
          : "border-white/10 bg-[#090d12] hover:border-monitor/35 hover:shadow-[0_0_34px_rgba(110,247,255,0.1)]"
        }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-monitor to-transparent opacity-70" />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-monitor/12 to-transparent"
        animate={{ y: active ? [0, 120, 0] : 0, opacity: active ? [0.1, 0.45, 0.1] : 0.1 }}
        transition={{ duration: 2.8, repeat: active ? Infinity : 0, ease: "easeInOut" }}
      />
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-trauma/80 via-monitor to-scrub/80 opacity-70" />
      {reviewed && (
        <div className="absolute inset-x-0 bottom-0 h-2 bg-scrub shadow-[0_0_28px_rgba(34,245,199,0.5)]" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-20 w-20 place-items-center rounded-md border ${active ? "border-scrub/35 bg-scrub/10 text-scrub" : "border-white/10 bg-white/[0.04] text-white/55"}`}>
          <Icon className="h-11 w-11" />
        </div>
        {reviewed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-scrub/35 bg-scrub/10 px-4 py-2 font-display text-xs font-black uppercase tracking-[0.12em] text-scrub">
            <CheckCircle2 className="h-5 w-5" />
            Reviewed
          </span>
        ) : (
          <span className="rounded-full border border-monitor/20 bg-monitor/10 px-4 py-2 font-display text-xs font-black uppercase tracking-[0.12em] text-monitor">
            {readOnly ? "Awaiting Learner" : "Access File"}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="font-display text-3xl font-black uppercase leading-8 text-white">{file.title}</div>
      </div>
      {active && <motion.div layoutId="case-file-scan" className="absolute inset-x-0 bottom-0 h-1 bg-scrub" />}
    </motion.button>
  );
}

function CaseFileViewer({ file }: { file: CaseFile }) {
  const Icon = file.Icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={file.id}
        initial={{ opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -14 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="relative grid h-full min-h-0 grid-rows-[auto_auto_1fr] overflow-hidden rounded-md border border-monitor/30 bg-[#050d10] p-6 shadow-[0_0_110px_rgba(110,247,255,0.13)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(110,247,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(110,247,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-monitor/20 to-transparent"
          initial={{ y: -90 }}
          animate={{ y: 650 }}
          transition={{ duration: 1.45, ease: "easeInOut" }}
        />

        <div className="relative z-[1] flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-20 w-20 place-items-center rounded-md border border-monitor/25 bg-monitor/10 text-monitor">
              <Icon className="h-11 w-11" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-black uppercase tracking-[0.2em] text-monitor">File Accessed</div>
              <h3 className="mt-2 font-display text-6xl font-black uppercase leading-none text-white">{file.title}</h3>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md border border-scrub/25 bg-scrub/10 px-4 py-3 font-display text-xs font-black uppercase tracking-[0.14em] text-scrub"
          >
            Access Granted
          </motion.div>
        </div>

        <div className="relative z-[1] mt-6 rounded-md border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 font-display text-xs font-black uppercase tracking-[0.18em] text-white/40">
            <KeyRound className="h-3.5 w-3.5 text-monitor" />
            Patient ID Strip
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {["Emma G.", "67F", "167 lb / 75.7 kg", "5'2\"", "BMI 30.5"].map((item) => (
              <div key={item} className="rounded-md border border-monitor/15 bg-monitor/10 px-4 py-4 font-display text-xl font-black uppercase text-monitor">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-[1] mt-6 grid min-h-0 content-start gap-4 overflow-y-auto pr-1 md:grid-cols-2">
          {file.rows.map(([label, value], index) => {
            const critical = isCriticalRow(file, label, value);
            return (
              <motion.div
                key={`${label}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.24 }}
                className={`rounded-md border p-6 shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${critical ? "border-trauma/30 bg-trauma/10" : "border-white/10 bg-white/[0.055]"
                  }`}
              >
                <div>
                  <div className="font-display text-sm font-black uppercase tracking-[0.16em] text-white/44">{label}</div>
                </div>
                <div className="mt-3 text-3xl font-semibold leading-10 text-white/88">{value}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function DeskArtifacts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute bottom-24 left-10 h-20 w-64 rounded-md border border-scrub/20 bg-[#061011] opacity-70 shadow-[0_16px_30px_rgba(0,0,0,0.22)]"
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 0.7, x: 0 }}
      >
        <MonitorStrip />
      </motion.div>
    </div>
  );
}

export function PatientCaseReview({
  role,
  reviewedFileIds,
  activeFileId,
  onOpenFile,
  onContinue,
  isClosing,
  audioEffectsEnabled = true,
  audioTracksEnabled = true
}: {
  role: "host" | "player";
  reviewedFileIds: string[];
  activeFileId?: string | null;
  onOpenFile: (fileId: string) => void;
  onContinue: () => void;
  isClosing?: boolean;
  audioEffectsEnabled?: boolean;
  audioTracksEnabled?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reviewedIds = new Set(["identity", ...reviewedFileIds]);
  const activeId = activeFileId && caseFiles.some((file) => file.id === activeFileId) ? activeFileId : caseFiles[0].id;
  const activeFile = caseFiles.find((file) => file.id === activeId) ?? caseFiles[0];
  const progress = Math.round((reviewedIds.size / caseFiles.length) * 100);
  const ready = reviewedIds.size >= caseFiles.length;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioTracksEnabled) return;
    audio.volume = 0.15;
    audio.loop = true;
    const promise = audio.play();
    if (promise) promise.catch(() => undefined);
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioTracksEnabled]);

  function handleContinue() {
    const audio = audioRef.current;
    if (!audio) {
      onContinue();
      return;
    }

    const fadeOutDuration = 800;
    const fadeInterval = 40;
    const volumeStep = audio.volume / (fadeOutDuration / fadeInterval);
    const fade = setInterval(() => {
      if (audio.volume > volumeStep) {
        audio.volume -= volumeStep;
      } else {
        clearInterval(fade);
        audio.pause();
        audio.currentTime = 0;
        onContinue();
      }
    }, fadeInterval);
  }

  function openFile(id: string) {
    if (role === "player") {
      if (audioEffectsEnabled) playFileClickCue();
      onOpenFile(id);
    }
  }

  return (
    <motion.div
      key="patient-case-review"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative grid h-screen grid-rows-[auto_1fr_auto] overflow-hidden p-4 md:p-6"
    >
      <DeskArtifacts />
      <header className="relative z-[1] flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="font-display text-xs font-black uppercase tracking-[0.26em] text-scrub">Patient Case File</div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">Emma Gonnadye</h2>
          <p className="mt-2 text-white/55">Access patient intel files before entering the simulation.</p>
        </div>
        <div className="grid min-w-[320px] gap-3 rounded-md border border-white/10 bg-black/45 p-4 shadow-[0_0_44px_rgba(110,247,255,0.08)]">
          <div className="flex items-center justify-between">
            <div className="font-display text-sm font-black uppercase tracking-[0.16em] text-white/50">Intel Review Progress</div>
            <div className="font-display text-2xl font-black text-scrub">{reviewedIds.size} / {caseFiles.length}</div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10 shadow-[0_0_22px_rgba(110,247,255,0.12)]">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-trauma via-monitor to-scrub shadow-[0_0_24px_rgba(34,245,199,0.55)]" animate={{ width: `${progress}%` }} />
          </div>
          <div className={`font-display text-sm font-black uppercase tracking-[0.14em] ${ready ? "text-scrub" : "text-amber"}`}>
            {ready ? "Simulation Unlocked" : "Simulation Locked: Review all files"}
          </div>
          <AnimatePresence>
            {ready && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-md border border-scrub/25 bg-scrub/10 px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.14em] text-scrub"
              >
                <ShieldCheck className="h-4 w-4" />
                Patient intel complete. Simulation unlocked.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="relative z-[1] grid min-h-0 gap-5 py-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(560px,1fr)]">
        <section className="grid min-h-0 content-start gap-4 rounded-md border border-white/10 bg-black/45 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
          <div className="h-20 overflow-hidden rounded-md border border-monitor/15 bg-black/35 p-2">
            <MonitorStrip />
          </div>
          <div className="grid gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {caseFiles.map((file) => (
              <CaseFileCard
                key={file.id}
                file={file}
                active={file.id === activeId}
                reviewed={reviewedIds.has(file.id)}
                readOnly={role === "host"}
                onOpen={() => openFile(file.id)}
              />
            ))}
          </div>
        </section>

        <CaseFileViewer file={activeFile} />
      </main>

      <footer className="relative z-[1] flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-display text-xs font-black uppercase tracking-[0.14em] text-white/45">
          Files Reviewed: {reviewedIds.size} / {caseFiles.length}
        </div>
        <div className="flex items-center gap-2">
          {role === "host" ? (
            <AnimatedButton variant="secondary" onClick={handleContinue} disabled={!ready}>
              {ready ? "Enter Simulation" : "Review All 7 Files"}
            </AnimatedButton>
          ) : (
            <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-display text-xs font-black uppercase tracking-[0.14em] text-white/42">
              {ready ? "Case review complete" : "Open every file"}
            </div>
          )}
        </div>
      </footer>
      <audio ref={audioRef} src={caseAudioSrc} preload="auto" />
    </motion.div>
  );
}
