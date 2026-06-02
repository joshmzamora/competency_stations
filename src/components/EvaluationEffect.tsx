import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import type { EvaluationStatus } from "../types";
import { playEvaluationCue } from "../utils/sound";

const effectCopy = {
  correct: {
    label: "Correct",
    detail: "Competency checkpoint met",
    icon: CheckCircle2,
    className: "border-scrub/60 bg-scrub/20 text-scrub shadow-scrub",
    wash: "bg-scrub/12"
  },
  partial: {
    label: "Partial Credit",
    detail: "Review and reinforce",
    icon: MinusCircle,
    className: "border-amber/60 bg-amber/20 text-amber",
    wash: "bg-amber/12"
  },
  incorrect: {
    label: "Needs Correction",
    detail: "Stop, coach, and retry",
    icon: XCircle,
    className: "border-trauma/60 bg-trauma/20 text-trauma shadow-alert",
    wash: "bg-trauma/12"
  }
};

export function EvaluationEffect({
  status,
  visible,
  subtle = false,
  audioEnabled = true
}: {
  status?: EvaluationStatus;
  visible: boolean;
  subtle?: boolean;
  audioEnabled?: boolean;
}) {
  const effect = status ? effectCopy[status] : null;
  const Icon = effect?.icon;

  useEffect(() => {
    if (!visible || !status || !audioEnabled) return;
    try {
      playEvaluationCue(status, subtle);
    } catch {
      // Browsers can block audio until the user has interacted with the page.
    }
  }, [audioEnabled, status, subtle, visible]);

  return (
    <AnimatePresence>
      {visible && effect && Icon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`pointer-events-none fixed inset-0 z-50 grid place-items-center ${subtle ? "bg-black/10" : `bg-black/80 ${effect.wash}`}`}
        >
          {!subtle && (
            <motion.div
              initial={{ scale: 0.74, opacity: 0, y: 24 }}
              animate={{ scale: [0.74, 1.03, 1], opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.48 }}
              className={`grid min-h-[58vh] w-[min(92vw,900px)] place-items-center rounded-md border px-8 py-10 text-center backdrop-blur-xl ${effect.className}`}
            >
              <div>
                <Icon className="mx-auto h-28 w-28 md:h-36 md:w-36" />
                <div className="mt-7 font-display text-6xl font-black uppercase leading-none text-white md:text-8xl">{effect.label}</div>
                <div className="mt-4 font-display text-base font-bold uppercase tracking-[0.24em] text-white/70 md:text-xl">{effect.detail}</div>
              </div>
            </motion.div>
          )}

          {subtle && (
            <motion.div
              initial={{ y: -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              className={`absolute right-5 top-24 rounded-md border px-4 py-3 backdrop-blur-xl ${effect.className}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <div>
                  <div className="font-display text-sm font-black uppercase tracking-[0.12em] text-white">{effect.label}</div>
                  <div className="text-xs text-white/60">{effect.detail}</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
