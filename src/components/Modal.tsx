import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0.94, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            className="w-full max-w-2xl rounded-md border border-white/15 bg-panel p-5 shadow-alert"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl font-bold uppercase tracking-[0.12em] text-white">{title}</h2>
              <button type="button" onClick={onClose} className="rounded-md border border-white/10 p-2 text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="pt-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
