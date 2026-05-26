import { motion } from "framer-motion";
import type { Question } from "../types";

export function JeopardyTile({
  question,
  used,
  onSelect
}: {
  question: Question;
  used: boolean;
  onSelect: (question: Question) => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      whileHover={!used ? { y: -4, boxShadow: "0 0 26px rgba(36,245,199,0.24)" } : undefined}
      whileTap={!used ? { scale: 0.96 } : undefined}
      disabled={used}
      onClick={() => onSelect(question)}
      className={`aspect-[1.2] rounded-md border p-2 font-display text-2xl font-bold transition sm:text-3xl ${
        used
          ? "border-white/5 bg-white/[0.03] text-white/20"
          : "border-scrub/40 bg-gradient-to-br from-panel to-black text-scrub shadow-scrub"
      }`}
      aria-label={`${question.category} for ${question.points}`}
    >
      {used ? "LOCKED" : question.points}
    </motion.button>
  );
}
