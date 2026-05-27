import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import type { CompetencyPrompt } from "../types";

export function Flashcard({ prompt }: { prompt: CompetencyPrompt }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      className="group min-h-[340px] w-full rounded-md border border-scrub/35 bg-black/45 p-1 text-left shadow-scrub [perspective:1200px]"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative h-full min-h-[330px] rounded-[4px] [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 flex flex-col justify-between rounded-[4px] bg-panel/95 p-7 [backface-visibility:hidden]">
          <div>
            <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-scrub">{prompt.type.replace(/-/g, " ")}</div>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-white">{prompt.scenario}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/55">
            <RotateCcw className="h-4 w-4" />
            Flip card
          </div>
        </div>
        <div className="absolute inset-0 flex rotate-y-180 flex-col justify-between rounded-[4px] border border-trauma/30 bg-[#170b10] p-7 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-trauma">Answer</div>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-white">{prompt.expectedResponse}</h2>
            <p className="mt-5 text-base leading-7 text-white/70">{prompt.explanation}</p>
          </div>
          <div className="text-sm text-white/45">Tap to return</div>
        </div>
      </motion.div>
    </button>
  );
}
