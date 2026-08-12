import { motion } from "framer-motion";
import { ArrowRight, MonitorPlay, Radio, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { StationCard } from "../components/StationCard";
import { stations } from "../data/stations";

const actions = [
  {
    to: "/host",
    title: "Host a session",
    description: "Run a synchronized competency checkoff and evaluate participants in real time.",
    icon: MonitorPlay,
    iconClass: "text-trauma",
    borderClass: "border-l-trauma/55"
  },
  {
    to: "/player",
    title: "Join as player",
    description: "Connect to an active host session from a second screen on the same network.",
    icon: Radio,
    iconClass: "text-scrub",
    borderClass: "border-l-scrub/55"
  },
  {
    to: "/solo",
    title: "Practice solo",
    description: "Work through every station independently with timers, feedback, and scoring.",
    icon: UserRound,
    iconClass: "text-monitor",
    borderClass: "border-l-monitor/55"
  }
];

export function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-6 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-sm font-medium text-white/40">Nursing simulation training</p>
        <div className="mt-4 max-w-4xl">
          <h1 className="font-display text-5xl font-black leading-[0.96] text-white md:text-6xl lg:text-7xl">
            Competency Stations
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 md:text-lg md:leading-8">
            Clinical competency checkoffs, guided scenarios, and practical troubleshooting for instructor-led sessions or independent practice.
          </p>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-3 lg:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + index * 0.04, duration: 0.3 }}
            >
              <Link
                to={action.to}
                className={`group flex h-full min-h-40 flex-col justify-between rounded-lg border border-l-2 border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20 hover:bg-white/[0.045] ${action.borderClass}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-black/25">
                    <Icon className={`h-[22px] w-[22px] ${action.iconClass}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/55" />
                </div>
                <div className="mt-7">
                  <h2 className="text-xl font-semibold text-white">{action.title}</h2>
                  <p className="mt-1.5 max-w-sm text-sm leading-6 text-white/50">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-14 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-3xl font-black text-white md:text-4xl">Stations</h2>
          <p className="mt-1 text-sm text-white/45">Choose a module to open it in host mode.</p>
        </div>
        <div className="text-sm text-white/35">{stations.length} modules</div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.025, duration: 0.28 }}
          >
            <StationCard
              station={station}
              showProgress={false}
              onSelect={(selectedStation) => {
                window.location.href = `/host?station=${selectedStation.id}`;
              }}
            />
          </motion.div>
        ))}
      </div>

      <footer className="mt-14 border-t border-white/[0.07] pt-5 text-sm text-white/28">
        Competency Stations · Nursing simulation training
      </footer>
    </section>
  );
}
