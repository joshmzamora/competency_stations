import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Droplets,
  Gauge,
  HeartPulse,
  Lungs,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import type { CompetencyStation } from "../types";

const accentClasses = {
  trauma: "border-trauma/35 bg-trauma/10 text-trauma",
  scrub: "border-scrub/35 bg-scrub/10 text-scrub",
  monitor: "border-monitor/35 bg-monitor/10 text-monitor",
  amber: "border-amber/35 bg-amber/10 text-amber"
};

const stationIcons: Record<string, typeof Activity> = {
  "code-blue": HeartPulse,
  hemodynamics: Gauge,
  "chest-tube": Lungs,
  "code-bert": ShieldAlert,
  stroke: Brain,
  "cauti-clabsi-prevention": ShieldCheck,
  "glycemic-control": Droplets
};

export function StationCard({
  station,
  completed,
  disabled = false,
  statusLabel,
  showProgress = true,
  onSelect
}: {
  station: CompetencyStation;
  completed?: number;
  disabled?: boolean;
  statusLabel?: string;
  showProgress?: boolean;
  onSelect: (station: CompetencyStation) => void;
}) {
  const progress = Math.round(((completed ?? 0) / Math.max(1, station.prompts.length)) * 100);
  const StationIcon = stationIcons[station.id] ?? Activity;

  return (
    <motion.button
      type="button"
      layout
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 0 }}
      disabled={disabled}
      onClick={() => onSelect(station)}
      className={`group flex h-full min-h-[228px] w-full flex-col rounded-lg border p-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-white/[0.07] bg-white/[0.015] opacity-50"
          : "border-white/10 bg-[#0b0f14]/80 hover:border-white/20 hover:bg-[#0d1218]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-9 w-9 place-items-center rounded-md border ${accentClasses[station.accent]}`}>
          <StationIcon className="h-[18px] w-[18px]" />
        </span>

        {disabled && statusLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-scrub/20 bg-scrub/[0.07] px-2.5 py-1 text-xs font-semibold text-scrub">
            <CheckCircle2 className="h-3.5 w-3.5" /> {statusLabel}
          </span>
        ) : showProgress ? (
          <span className="text-xs font-medium text-white/35">{progress}% complete</span>
        ) : null}
      </div>

      <div className="mt-4">
        <h3 className="font-display text-[1.35rem] font-black leading-tight text-white">{station.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-[1.45rem] text-white/52">{station.description}</p>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-white/43">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-white/30" />
            {station.estimatedMinutes} min
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <ClipboardCheck className="h-3.5 w-3.5 flex-none text-white/30" />
            <span className="truncate">{station.competencyType}</span>
          </div>
        </div>

        {showProgress ? (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-trauma via-monitor to-scrub transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>
    </motion.button>
  );
}
