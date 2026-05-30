import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  FileText,
  HeartPulse,
  LockKeyhole,
  Monitor,
  Pill,
  Stethoscope,
  UserRound
} from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatedButton } from "./AnimatedButton";

type CaseFile = {
  id: string;
  title: string;
  subtitle: string;
  Icon: typeof FileText;
  required?: boolean;
  critical?: string[];
  rows: Array<[string, string]>;
};

const caseFiles: CaseFile[] = [
  {
    id: "identity",
    title: "Patient Identity",
    subtitle: "Wristband and primary diagnosis",
    Icon: UserRound,
    required: true,
    critical: ["EF 20%", "COPD", "Chronic atrial fibrillation"],
    rows: [
      ["Patient Name", "Emma Gonnadye"],
      ["Age", "67"],
      ["Gender", "Female"],
      ["Weight", "90 kg"],
      ["Diagnosis", "Acute exacerbation of congestive heart failure, EF 20%; COPD; chronic atrial fibrillation"]
    ]
  },
  {
    id: "complaint",
    title: "Chief Complaint",
    subtitle: "Presenting concern",
    Icon: Stethoscope,
    rows: [["Chief Complaint", "Worsening shortness of breath and cough over the last couple of days"]]
  },
  {
    id: "hpi",
    title: "History Of Present Illness",
    subtitle: "Symptom progression",
    Icon: FileSearch,
    required: true,
    critical: ["Shortness of breath at rest"],
    rows: [
      [
        "HPI",
        "Emma was brought to the emergency department by her husband after complaining of shortness of breath and cough for the last couple of days. Initially, she complained of shortness of breath with exertion, but now complains of shortness of breath at rest."
      ]
    ]
  },
  {
    id: "history",
    title: "Past Medical History",
    subtitle: "Risk profile",
    Icon: HeartPulse,
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
    subtitle: "Home medication review",
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
    subtitle: "Bedside handoff findings",
    Icon: ClipboardList,
    required: true,
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
    subtitle: "Monitor and lab clues",
    Icon: Monitor,
    required: true,
    critical: ["EKG: atrial fibrillation", "Blood glucose 460 mg/dL"],
    rows: [
      ["EKG", "Atrial fibrillation"],
      ["Blood Glucose", "460 mg/dL"]
    ]
  }
];

function MonitorStrip() {
  return (
    <svg viewBox="0 0 720 120" className="h-full w-full" aria-hidden="true">
      <rect width="720" height="120" rx="16" fill="#061011" stroke="rgba(110,247,255,.18)" />
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

function CriticalClueBadge({ clue }: { clue: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-trauma/30 bg-trauma/10 px-3 py-1 font-display text-[10px] font-black uppercase tracking-[0.12em] text-trauma"
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      {clue}
    </motion.span>
  );
}

function CaseFileCard({
  file,
  active,
  reviewed,
  onOpen
}: {
  file: CaseFile;
  active: boolean;
  reviewed: boolean;
  onOpen: () => void;
}) {
  const Icon = file.Icon;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className={`group relative min-h-[142px] overflow-hidden rounded-md border p-4 text-left transition ${
        active ? "border-scrub/45 bg-scrub/10 shadow-[0_0_42px_rgba(34,245,199,0.12)]" : "border-white/10 bg-white/[0.045] hover:border-white/25"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-r from-white/[0.08] to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-12 w-12 place-items-center rounded-md border ${active ? "border-scrub/30 bg-scrub/10 text-scrub" : "border-white/10 bg-black/25 text-white/55"}`}>
          <Icon className="h-6 w-6" />
        </div>
        {reviewed ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-scrub/30 bg-scrub/10 px-2.5 py-1 font-display text-[9px] font-black uppercase tracking-[0.12em] text-scrub">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Reviewed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 font-display text-[9px] font-black uppercase tracking-[0.12em] text-white/42">
            <LockKeyhole className="h-3.5 w-3.5" />
            Click to open
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="font-display text-lg font-black uppercase leading-5 text-white">{file.title}</div>
        <div className="mt-1 text-sm text-white/52">{file.subtitle}</div>
      </div>
      {file.required && (
        <div className="mt-3 font-display text-[9px] font-black uppercase tracking-[0.14em] text-amber">
          Required file
        </div>
      )}
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
        initial={{ opacity: 0, x: 28, rotateY: -8 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -18, rotateY: 8 }}
        transition={{ duration: 0.34, ease: "easeOut" }}
        className="relative min-h-0 overflow-hidden rounded-md border border-monitor/20 bg-[#071012] p-5 shadow-[0_0_90px_rgba(110,247,255,0.1)]"
      >
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-monitor/12 to-transparent"
          initial={{ y: -80 }}
          animate={{ y: 420 }}
          transition={{ duration: 1.45, ease: "easeInOut" }}
        />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-md border border-monitor/25 bg-monitor/10 text-monitor">
              <Icon className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-monitor">Record opened</div>
              <h3 className="mt-1 font-display text-3xl font-black uppercase text-white">{file.title}</h3>
            </div>
          </div>
          <div className="rounded-md border border-scrub/25 bg-scrub/10 px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.14em] text-scrub">
            Case file
          </div>
        </div>

        {file.critical?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {file.critical.map((clue) => (
              <CriticalClueBadge key={clue} clue={clue} />
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid max-h-[52vh] gap-3 overflow-y-auto pr-1">
          {file.rows.map(([label, value], index) => (
            <motion.div
              key={`${label}-${index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.24 }}
              className="rounded-md border border-white/10 bg-white/[0.045] p-4"
            >
              <div className="font-display text-[10px] font-black uppercase tracking-[0.16em] text-white/38">{label}</div>
              <div className="mt-2 text-lg font-semibold leading-7 text-white/84">{value}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function PatientCaseReview({
  role,
  onContinue
}: {
  role: "host" | "player";
  onContinue: () => void;
}) {
  const [activeId, setActiveId] = useState(caseFiles[0].id);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => new Set([caseFiles[0].id]));
  const activeFile = caseFiles.find((file) => file.id === activeId) ?? caseFiles[0];
  const requiredIds = useMemo(() => caseFiles.filter((file) => file.required).map((file) => file.id), []);
  const requiredReviewed = requiredIds.filter((id) => reviewedIds.has(id)).length;
  const progress = Math.round((reviewedIds.size / caseFiles.length) * 100);
  const ready = requiredReviewed >= requiredIds.length;

  function openFile(id: string) {
    setActiveId(id);
    setReviewedIds((current) => new Set(current).add(id));
  }

  return (
    <motion.div
      key="patient-case-review"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative grid h-screen grid-rows-[auto_1fr_auto] p-4 md:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="font-display text-xs font-black uppercase tracking-[0.26em] text-scrub">Patient case file</div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">Emma Gonnadye</h2>
          <p className="mt-2 text-white/55">Review available records before entering the station.</p>
        </div>
        <div className="grid min-w-[260px] gap-2 rounded-md border border-white/10 bg-black/35 p-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-[10px] font-black uppercase tracking-[0.16em] text-white/42">Case review progress</div>
            <div className="font-display text-sm font-black text-scrub">{reviewedIds.size} / {caseFiles.length}</div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-trauma via-monitor to-scrub" animate={{ width: `${progress}%` }} />
          </div>
          <div className={`font-display text-[10px] font-black uppercase tracking-[0.14em] ${ready ? "text-scrub" : "text-amber"}`}>
            {ready ? "Ready for station" : `${requiredReviewed} / ${requiredIds.length} required files reviewed`}
          </div>
        </div>
      </header>

      <main className="grid min-h-0 gap-5 py-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.8fr)]">
        <section className="grid min-h-0 content-start gap-4">
          <div className="h-20 overflow-hidden rounded-md border border-monitor/15 bg-black/35 p-2">
            <MonitorStrip />
          </div>
          <div className="grid gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            {caseFiles.map((file) => (
              <CaseFileCard
                key={file.id}
                file={file}
                active={file.id === activeId}
                reviewed={reviewedIds.has(file.id)}
                onOpen={() => openFile(file.id)}
              />
            ))}
          </div>
        </section>

        <CaseFileViewer file={activeFile} />
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-display text-xs font-black uppercase tracking-[0.14em] text-white/45">
          <Activity className="h-4 w-4 text-monitor" />
          Patient review occurs after the six-scene intro and before station prompts.
        </div>
        {role === "host" ? (
          <AnimatedButton variant="secondary" onClick={onContinue}>
            Enter Simulation
          </AnimatedButton>
        ) : (
          <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-display text-xs font-black uppercase tracking-[0.14em] text-white/42">
            Waiting for host
          </div>
        )}
      </footer>
    </motion.div>
  );
}
