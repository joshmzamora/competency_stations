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
  ShieldAlert,
  ShieldCheck,
  Wind
} from "lucide-react";
import type { CompetencyStation } from "../types";

const accentClasses = {
  trauma: "border-trauma/35 bg-trauma/10 text-trauma",
  scrub: "border-scrub/35 bg-scrub/10 text-scrub",
  monitor: "border-monitor/35 bg-monitor/10 text-monitor",
  amber: "border-amber/35 bg-amber/10 text-amber"
};

const iconToneClasses = {
  trauma: "text-trauma",
  scrub: "text-scrub",
  monitor: "text-monitor",
  amber: "text-amber"
};

const accentEdgeClasses = {
  trauma: "border-l-trauma/65",
  scrub: "border-l-scrub/65",
  monitor: "border-l-monitor/65",
  amber: "border-l-amber/65"
};

const stationIcons: Record<string, typeof Activity> = {
  "code-blue": HeartPulse,
  hemodynamics: Gauge,
  "chest-tube": Wind,
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
  compact = false,
  onSelect
}: {
  station: CompetencyStation;
  completed?: number;
  disabled?: boolean;
  statusLabel?: string;
  showProgress?: boolean;
  compact?: boolean;
  onSelect: (station: CompetencyStation) => void;
}) {
  const progress = Math.round(((completed ?? 0) / Math.max(1, station.prompts.length)) * 100);
  const StationIcon = stationIcons[station.id] ?? Activity;

  return (
    <motion.button
      type="button"
      layout={!compact}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 0 }}
      disabled={disabled}
      onClick={() => onSelect(station)}
      className={`group grid h-full w-full grid-rows-[auto_auto_1fr_auto] rounded-lg border border-l-2 text-left transition ${accentEdgeClasses[station.accent]} ${
        compact ? "min-h-[184px] p-4" : "min-h-[220px] p-4"
      } ${
        disabled
          ? "cursor-not-allowed border-white/[0.07] bg-white/[0.015] opacity-50"
          : "border-white/10 bg-[#0b0f14]/80 hover:border-white/20 hover:bg-[#0d1218]"
      }`}
    >
      <div className="flex min-h-9 items-start justify-between gap-4">
        <span
          className={`grid h-9 w-9 place-items-center rounded-md border ${
            compact ? `border-white/10 bg-black/20 ${iconToneClasses[station.accent]}` : accentClasses[station.accent]
          }`}
        >
          <StationIcon className="h-[18px] w-[18px]" />
        </span>

        {disabled && statusLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-scrub/20 bg-scrub/[0.07] px-2.5 py-1 text-xs font-semibold text-scrub">
            <CheckCircle2 className="h-3.5 w-3.5" /> {statusLabel}
          </span>
        ) : showProgress ? (
          <span className="pt-1 text-xs font-medium tabular-nums text-white/45">{progress}% complete</span>
        ) : null}
      </div>

      <h3
        className={`font-display font-black leading-[1.1] text-white ${
          compact ? "mt-3 min-h-[2.7rem] text-xl" : "mt-4 min-h-[3.3rem] text-[1.35rem]"
        }`}
      >
        {station.title}
      </h3>

      <p
        className={`${compact ? "mt-1 line-clamp-2 min-h-[2.9rem]" : "mt-1.5 line-clamp-3 min-h-[4.35rem]"} text-sm leading-[1.45rem] text-white/58`}
      >
        {station.description}
      </p>

      <div className={compact ? "pt-3" : "pt-4"}>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 text-[13px] text-white/50">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 text-white/35" />
            {station.estimatedMinutes} min
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <ClipboardCheck className="h-3.5 w-3.5 flex-none text-white/35" />
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
