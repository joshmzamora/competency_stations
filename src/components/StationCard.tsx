import { motion } from "framer-motion";
import { Activity, Clock, ClipboardCheck } from "lucide-react";
import type { CompetencyStation } from "../types";

const accentClasses = {
  trauma: "border-trauma/35 bg-trauma/10 text-trauma",
  scrub: "border-scrub/35 bg-scrub/10 text-scrub",
  monitor: "border-monitor/35 bg-monitor/10 text-monitor",
  amber: "border-amber/35 bg-amber/10 text-amber"
};

export function StationCard({
  station,
  completed,
  onSelect
}: {
  station: CompetencyStation;
  completed?: number;
  onSelect: (station: CompetencyStation) => void;
}) {
  const progress = Math.round(((completed ?? 0) / Math.max(1, station.prompts.length)) * 100);

  return (
    <motion.button
      type="button"
      layout
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(station)}
      className="group min-h-[260px] rounded-md border border-white/10 bg-black/40 p-5 text-left shadow-[0_18px_46px_rgba(0,0,0,0.28)] transition hover:border-scrub/35 hover:shadow-scrub"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`rounded-md border px-3 py-2 ${accentClasses[station.accent]}`}>
          <Activity className="h-5 w-5" />
        </span>
        <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/45">{progress}% complete</span>
      </div>
      <h3 className="mt-6 font-display text-3xl font-black uppercase leading-none text-white">{station.title}</h3>
      <p className="mt-4 min-h-16 text-sm leading-6 text-white/65">{station.description}</p>
      <div className="mt-6 grid gap-3 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-monitor" />
          {station.estimatedMinutes} min
        </div>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-scrub" />
          {station.competencyType}
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-trauma via-monitor to-scrub transition-all" style={{ width: `${progress}%` }} />
      </div>
    </motion.button>
  );
}
