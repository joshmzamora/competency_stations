import { AnimatePresence, motion } from "framer-motion";
import { Activity, HeartPulse, Monitor, Stethoscope, UserRound } from "lucide-react";
import { AnimatedButton } from "./AnimatedButton";

const profile = [
  ["Patient", "Emma Gonnadye"],
  ["Age", "67"],
  ["Gender", "Female"],
  ["Weight", "90 kg"],
  ["Diagnosis", "Acute exacerbation of congestive heart failure, EF 20%, COPD, chronic atrial fibrillation"],
  ["Chief complaint", "Worsening shortness of breath and cough over the last couple of days"]
];

const history = [
  "Brought to the emergency department by her husband after shortness of breath and cough for several days.",
  "Initially short of breath with exertion; now complains of shortness of breath at rest.",
  "Past history: hypertension, diabetes, CAD with stent, CKD stage III, chronic atrial fibrillation."
];

const medications = ["Insulin glargine 20 units at bedtime", "Furosemide 40 mg daily", "Aspirin 81 mg daily", "Eliquis 5 mg BID", "Carvedilol 25 mg twice daily"];

const report = [
  ["General", "Awake, alert, and oriented x 4"],
  ["Vital signs", "On the monitor"],
  ["Neurological", "Normal"],
  ["Cardiovascular", "Atrial fibrillation"],
  ["Respiratory", "Crackles bilaterally"],
  ["Peripheral vascular", "3+ pitting edema BLE"],
  ["Abdomen", "Soft, non-tender"],
  ["EKG", "Atrial fibrillation"],
  ["Blood glucose", "460 mg/dL"]
];

export function ScenarioIntro({ open, onClose, role }: { open: boolean; onClose: () => void; role: "host" | "player" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] overflow-y-auto bg-charcoal/95 p-4 backdrop-blur-xl"
        >
          <div className="pointer-events-none fixed inset-0 opacity-70">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(36,245,199,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,48,77,0.06)_1px,transparent_1px)] bg-[size:38px_38px]" />
            <div className="absolute inset-x-0 top-0 h-2/3 animate-scan bg-gradient-to-b from-transparent via-monitor/10 to-transparent" />
          </div>

          <motion.div
            initial={{ y: 28, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative mx-auto my-6 grid max-w-7xl gap-5 lg:grid-cols-[1fr_420px]"
          >
            <section className="rounded-md border border-scrub/25 bg-black/55 p-6 shadow-scrub">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="font-display text-xs font-bold uppercase tracking-[0.24em] text-trauma">Simulation prebrief</div>
                  <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white md:text-7xl">Scenario Live</h2>
                </div>
                <div className="grid h-20 w-20 place-items-center rounded-md border border-trauma/45 bg-trauma/10 shadow-alert">
                  <HeartPulse className="h-10 w-10 text-trauma" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["Breathes", "The manikin breathes and has a pulse.", Stethoscope],
                  ["Responds", "The patient can talk. Assess like a real patient.", UserRound],
                  ["Changes fast", "Vital signs and EKG are live on the monitor.", Monitor]
                ].map(([title, detail, Icon]) => (
                  <div key={String(title)} className="rounded-md border border-white/10 bg-white/[0.045] p-4">
                    <Icon className="h-6 w-6 text-scrub" />
                    <div className="mt-3 font-display text-xl font-black uppercase text-white">{String(title)}</div>
                    <p className="mt-2 text-sm leading-6 text-white/65">{String(detail)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-md border border-monitor/25 bg-monitor/10 p-5">
                <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Before proceeding</div>
                <p className="mt-3 text-lg leading-8 text-white/78">
                  Familiarize yourself with the manikin. Feel the pulse, auscultate heart and lung sounds, and remember
                  that the patient can talk. Pay close attention to vital signs because, like a real ICU patient, they can
                  change fast. Shape and number assignments may correspond to randomized station questions.
                </p>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-white/10 bg-black/35 p-5">
                  <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-scrub">History of present illness</div>
                  <ul className="mt-3 grid gap-2 text-white/72">
                    {history.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-white/10 bg-black/35 p-5">
                  <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-scrub">Medications</div>
                  <ul className="mt-3 grid gap-2 text-white/72">
                    {medications.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <aside className="grid content-start gap-5">
              <div className="rounded-md border border-trauma/30 bg-trauma/10 p-5 shadow-alert">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-trauma" />
                  <div>
                    <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white/45">Role</div>
                    <div className="font-display text-2xl font-black uppercase text-white">
                      {role === "host" ? "Evaluator control" : "Learner monitor"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-black/45 p-5">
                <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Patient profile</div>
                <div className="mt-4 grid gap-2">
                  {profile.map(([label, value]) => (
                    <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                      <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{label}</div>
                      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-black/45 p-5">
                <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">From report</div>
                <div className="mt-4 grid gap-2">
                  {report.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-3 border-b border-white/10 pb-2 last:border-b-0">
                      <span className="font-display text-xs font-bold uppercase tracking-[0.12em] text-white/45">{label}</span>
                      <span className="text-right text-sm text-white/78">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <AnimatedButton className="min-h-14 text-base" onClick={onClose}>
                Let&apos;s get started
              </AnimatedButton>
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
