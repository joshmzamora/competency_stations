import { motion } from "framer-motion";
import { ClipboardCheck, MonitorPlay, Radio, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { StationCard } from "../components/StationCard";
import { stations } from "../data/stations";

const actions = [
  { to: "/host", label: "Start Host Mode", icon: MonitorPlay, accent: "text-trauma" },
  { to: "/player", label: "Start Player Mode", icon: Radio, accent: "text-scrub" },
  { to: "/solo", label: "One Player Practice", icon: UserRound, accent: "text-monitor" }
];

export function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-3 rounded-md border border-trauma/30 bg-trauma/10 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-trauma">
          <ClipboardCheck className="h-4 w-4" />
          Simulation lab control
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="max-w-4xl font-display text-5xl font-black uppercase leading-[0.92] tracking-normal text-white md:text-7xl">
              Competency Stations
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              A simulation system for nursing competency checkoffs, guided scenarios, practical troubleshooting, host-led evaluation,
              and one-player self-practice. Run a synchronized local-network session or practice a station on a single computer.
            </p>
          </div>
          <div className="grid gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex min-h-14 items-center justify-between rounded-md border border-white/10 bg-white/[0.045] px-4 transition hover:border-scrub/40 hover:bg-scrub/10"
                >
                  <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-white">{action.label}</span>
                  <Icon className={`h-5 w-5 ${action.accent} transition group-hover:scale-110`} />
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.04 }}
          >
            <StationCard
              station={station}
              onSelect={(selectedStation) => {
                window.location.href = `/host?station=${selectedStation.id}`;
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
