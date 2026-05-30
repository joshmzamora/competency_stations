import { AnimatePresence, motion } from "framer-motion";
import type { CompetencyStation, PlayerStation } from "../types";

export function StationTransition({ station, visible }: { station?: CompetencyStation | PlayerStation | null; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && station ? (
        <motion.div
          key={station.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none fixed inset-0 z-[215] grid place-items-center overflow-hidden bg-[#030406] text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(110,247,255,0.045)_1px,transparent_1px)] bg-[size:38px_38px]" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-1/2 h-px w-full origin-left bg-trauma/70 shadow-[0_0_32px_rgba(255,48,77,0.45)]"
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.62, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[42%] right-0 h-px w-full origin-right bg-monitor/70 shadow-[0_0_32px_rgba(110,247,255,0.32)]"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid w-[min(90vw,940px)] justify-items-center gap-5 text-center"
          >
            <div className="rounded-full border border-trauma/40 bg-trauma/10 px-4 py-1.5 font-display text-xs font-black uppercase tracking-[0.28em] text-trauma">
              Station change
            </div>
            <motion.h2
              initial={{ letterSpacing: "0.18em" }}
              animate={{ letterSpacing: "0em" }}
              transition={{ duration: 0.5 }}
              className="font-display text-5xl font-black uppercase leading-none md:text-8xl"
            >
              {station.title}
            </motion.h2>
            <div className="max-w-2xl text-base leading-7 text-white/60 md:text-lg">{station.competencyType}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
