import { AnimatePresence, motion } from "framer-motion";
import { Timer } from "lucide-react";

export function TimesUpEffect({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="times-up"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[300] grid place-items-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="grid place-items-center gap-4"
          >
            <div className="grid h-48 w-48 place-items-center rounded-full bg-trauma/90 text-white shadow-2xl">
              <Timer className="h-24 w-24" />
            </div>
            <div className="font-display text-6xl font-black uppercase text-white">Time's Up</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
