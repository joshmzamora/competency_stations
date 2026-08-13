import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
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

const accentTextClasses = {
  trauma: "text-trauma",
  scrub: "text-scrub",
  monitor: "text-monitor",
  amber: "text-amber"
};

const accentGlowClasses = {
  trauma: "bg-trauma/15",
  scrub: "bg-scrub/15",
  monitor: "bg-monitor/15",
  amber: "bg-amber/15"
};

const accentTopClasses = {
  trauma: "from-trauma/85 via-trauma/25 to-transparent",
  scrub: "from-scrub/85 via-scrub/25 to-transparent",
  monitor: "from-monitor/85 via-monitor/25 to-transparent",
  amber: "from-amber/85 via-amber/25 to-transparent"
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
  variant = "default",
  onSelect
}: {
  station: CompetencyStation;
  completed?: number;
  disabled?: boolean;
  statusLabel?: string;
  showProgress?: boolean;
  variant?: "default" | "home";
  onSelect: (station: CompetencyStation) => void;
}) {
  const progress = Math.round(((completed ?? 0) / Math.max(1, station.prompts.length)) * 100);
  const StationIcon = stationIcons[station.id] ?? Activity;

  if (variant === "home") {
    return (
      <motion.button
        type="button"
        whileHover={disabled ? undefined : { y: -2 }}
        whileTap={disabled ? undefined : { y: 0 }}
        disabled={disabled}
        onClick={() => onSelect(station)}
        className={`group relative grid h-full min-h-[188px] w-full grid-rows-[auto_1fr_auto] overflow-hidden rounded-xl border p-5 text-left transition duration-200 ${
          disabled
            ? "cursor-not-allowed border-white/[0.07] bg-white/[0.015] opacity-50"
            : "border-white/[0.09] bg-gradient-to-b from-white/[0.045] to-white/[0.018] hover:border-white/[0.18] hover:from-white/[0.065] hover:to-white/[0.025]"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentTopClasses[station.accent]}`}
        />
        <div
          className={`pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full blur-3xl transition-opacity duration-200 ${accentGlowClasses[station.accent]} opacity-35 group-hover:opacity-55`}
        />

        <div className="relative flex items-start justify-between gap-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/30 shadow-inner shadow-white/[0.025]">
            <StationIcon className={`h-5 w-5 ${accentTextClasses[station.accent]}`} />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-black/20 px-2.5 py-1 text-xs font-medium tabular-nums text-white/55">
            <Clock className="h-3.5 w-3.5 text-white/35" />
            {station.estimatedMinutes} min
          </span>
        </div>

        <div className="relative mt-5 self-start">
          <h3 className="font-display text-[1.45rem] font-black leading-[1.05] text-white transition-colors group-hover:text-white">
            {station.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
            {station.description}
          </p>
        </div>

        <div className="relative mt-5 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-3.5 text-[12px] font-medium text-white/42">
          <span className="min-w-0 truncate">{station.competencyType}</span>
          <span className={`inline-flex flex-none items-center gap-1 transition ${accentTextClasses[station.accent]} opacity-65 group-hover:opacity-100`}>
            Open <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      layout
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 0 }}
      disabled={disabled}
      onClick={() => onSelect(station)}
      className={`group grid h-full min-h-[220px] w-full grid-rows-[auto_auto_1fr_auto] rounded-lg border border-l-2 p-4 text-left transition ${accentEdgeClasses[station.accent]} ${
        disabled
          ? "cursor-not-allowed border-white/[0.07] bg-white/[0.015] opacity-50"
          : "border-white/10 bg-[#0b0f14]/80 hover:border-white/20 hover:bg-[#0d1218]"
      }`}
    >
      <div className="flex min-h-9 items-start justify-between gap-4">
        <span className={`grid h-9 w-9 place-items-center rounded-md border ${accentClasses[station.accent]}`}>
          <StationIcon className="h-[18px] w-[18px]" />
        </span>

        {disabled && statusLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-scrub/20 bg-scrub/[0.07] px-2.5 py-1 text-xs font-semibold text-scrub">
            <CheckCircle2 className="h-3.5 w-3.5" /> {statusLabel}
          </span>
        ) : showProgress ? (
          <span className="pt-1 text-xs font-medium tabular-nums text-white/35">{progress}% complete</span>
        ) : null}
      </div>

      <h3 className="mt-4 min-h-[3.3rem] font-display text-[1.35rem] font-black leading-[1.1] text-white">
        {station.title}
      </h3>

      <p className="mt-1.5 line-clamp-3 min-h-[4.35rem] text-sm leading-[1.45rem] text-white/52">
        {station.description}
      </p>

      <div className="pt-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 text-[13px] text-white/43">
          <div className="flex items-center gap-2 whitespace-nowrap">
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
