import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";

export function PhaseBrief({
  visible,
  label,
  title,
  subtitle
}: {
  visible: boolean;
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none absolute inset-0 z-[40] grid place-items-center overflow-hidden bg-[#030506] text-center text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(110,247,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(110,247,255,0.18),transparent_34%),radial-gradient(circle_at_50%_72%,rgba(255,48,77,0.13),transparent_38%)]" />
          <div className="absolute left-1/2 top-1/2 h-56 w-[min(86vw,980px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-monitor/10 blur-3xl" />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 1.02 }}
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid max-w-5xl justify-items-center gap-5 px-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-scrub/30 bg-scrub/10 px-5 py-2 font-display text-sm font-black uppercase tracking-[0.24em] text-scrub">
              <Activity className="h-4 w-4" />
              {label}
            </div>
            <h2 className="font-display text-6xl font-black uppercase leading-none md:text-8xl">{title}</h2>
            <p className="max-w-3xl text-2xl font-semibold leading-9 text-white/72">{subtitle}</p>
            <div className="mt-2 grid h-16 w-16 place-items-center rounded-full border border-monitor/30 bg-monitor/10 text-monitor">
              <ArrowRight className="h-8 w-8" />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
