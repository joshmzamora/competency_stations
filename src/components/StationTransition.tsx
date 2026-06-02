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
          transition={{ duration: 0.24 }}
          className="pointer-events-none fixed inset-0 z-[215] grid place-items-center overflow-hidden bg-[#030406] text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(110,247,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(110,247,255,0.16),transparent_34%),radial-gradient(circle_at_50%_74%,rgba(255,48,77,0.08),transparent_42%)]" />
          <motion.div
            initial={{ scale: 0.82, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.08, opacity: 0 }}
            transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            className="absolute h-[min(78vw,780px)] w-[min(78vw,780px)] rounded-full border border-white/10 shadow-[0_0_80px_rgba(110,247,255,0.08)]"
          />
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-monitor/10 to-transparent"
          />

          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, scale: 1.02, filter: "blur(6px)" }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid w-[min(94vw,1220px)] justify-items-center gap-7 text-center"
          >
            <div className="rounded-full border border-monitor/45 bg-monitor/10 px-5 py-2 font-display text-xs font-black uppercase tracking-[0.28em] text-monitor">
              Prepare for station
            </div>
            <motion.h2
              initial={{ letterSpacing: "0.22em", opacity: 0.55 }}
              animate={{ letterSpacing: "0em" }}
              transition={{ duration: 0.62 }}
              className="font-display text-6xl font-black uppercase leading-none md:text-9xl"
            >
              {station.title}
            </motion.h2>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="hidden h-px w-32 bg-white/15 md:block" />
              <div className="rounded-md border border-white/10 bg-black/40 px-5 py-3 font-display text-sm font-black uppercase tracking-[0.2em] text-white/65">
                Stand by for the next prompt
              </div>
              <div className="hidden h-px w-32 bg-white/15 md:block" />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
