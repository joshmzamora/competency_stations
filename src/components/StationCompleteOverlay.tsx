import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Medal, Play, ShieldCheck } from "lucide-react";
import { AnimatedButton } from "./AnimatedButton";

type StationCompleteSummary = {
  total: number;
  correct: number;
  partial: number;
  incorrect: number;
};

export function StationCompleteOverlay({
  visible,
  role,
  stationTitle,
  summary,
  allStationsComplete,
  onChooseNext,
  onStartDebrief
}: {
  visible: boolean;
  role: "host" | "player";
  stationTitle: string;
  summary: StationCompleteSummary;
  allStationsComplete?: boolean;
  onChooseNext?: () => void;
  onStartDebrief?: () => void;
}) {
  const accuracy = summary.total ? Math.round(((summary.correct * 100 + summary.partial * 50) / (summary.total * 100)) * 100) : 0;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="station-complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[225] grid place-items-center overflow-hidden bg-[#030506] px-4 text-center text-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(110,247,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(36,245,199,0.16),transparent_34%),radial-gradient(circle_at_50%_76%,rgba(255,48,77,0.1),transparent_42%)]" />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 1.02 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid w-[min(94vw,980px)] gap-6 rounded-md border border-scrub/25 bg-black/72 p-6 shadow-[0_0_90px_rgba(34,245,199,0.14)] md:p-9"
          >
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-scrub/35 bg-scrub/10 text-scrub">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <div className="font-display text-xs font-black uppercase tracking-[0.32em] text-scrub">Station complete</div>
              <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none md:text-7xl">{stationTitle}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-white/62">
                {role === "host"
                  ? allStationsComplete
                    ? "All station prompts are finished. Start the debrief when the room is ready."
                    : "Review the summary, then choose the next station from the station list."
                  : allStationsComplete
                    ? "All stations are complete. Stand by for the debrief."
                    : "Stand by while the facilitator prepares the next station."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-5">
              <div className="rounded-md border border-monitor/20 bg-monitor/10 p-4">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">Accuracy</div>
                <div className="mt-1 font-display text-4xl font-black text-monitor">{accuracy}%</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">Total</div>
                <div className="mt-1 font-display text-4xl font-black text-white">{summary.total}</div>
              </div>
              <div className="rounded-md border border-scrub/20 bg-scrub/10 p-4">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">Correct</div>
                <div className="mt-1 font-display text-4xl font-black text-scrub">{summary.correct}</div>
              </div>
              <div className="rounded-md border border-amber/20 bg-amber/10 p-4">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">Partial</div>
                <div className="mt-1 font-display text-4xl font-black text-amber">{summary.partial}</div>
              </div>
              <div className="rounded-md border border-trauma/20 bg-trauma/10 p-4">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">Missed</div>
                <div className="mt-1 font-display text-4xl font-black text-trauma">{summary.incorrect}</div>
              </div>
            </div>

            {role === "host" ? (
              <div className="mx-auto grid w-full max-w-xl gap-3 sm:grid-cols-2">
                {allStationsComplete ? (
                  <AnimatedButton variant="secondary" onClick={onStartDebrief} className="sm:col-span-2">
                    <Medal className="h-4 w-4" />
                    Start Debrief
                  </AnimatedButton>
                ) : (
                  <AnimatedButton variant="secondary" onClick={onChooseNext} className="sm:col-span-2">
                    <Play className="h-4 w-4" />
                    Choose Next Station
                  </AnimatedButton>
                )}
              </div>
            ) : (
              <div className="mx-auto inline-flex items-center gap-2 rounded-md border border-monitor/25 bg-monitor/10 px-4 py-3 font-display text-xs font-black uppercase tracking-[0.16em] text-monitor">
                <ShieldCheck className="h-4 w-4" />
                Waiting for facilitator
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
