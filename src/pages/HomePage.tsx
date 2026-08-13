import { motion } from "framer-motion";
import { ArrowRight, MonitorPlay, Radio, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { StationCard } from "../components/StationCard";
import { stations } from "../data/stations";

const actions = [
  {
    to: "/solo",
    title: "Practice Solo",
    description: "Complete stations independently with timers, feedback, and scoring.",
    cta: "Start practice",
    icon: UserRound,
    iconClass: "text-monitor",
    cardClass: "border-monitor/20 bg-monitor/[0.045] hover:border-monitor/35 hover:bg-monitor/[0.065]",
    iconWrapClass: "border-monitor/20 bg-monitor/[0.07]",
    layoutClass: "col-span-2 lg:col-span-1"
  },
  {
    to: "/host",
    title: "Host Session",
    description: "Run a guided competency checkoff and evaluate participants in real time.",
    cta: "Open host",
    icon: MonitorPlay,
    iconClass: "text-trauma",
    cardClass: "border-white/10 bg-white/[0.025] hover:border-trauma/25 hover:bg-white/[0.045]",
    iconWrapClass: "border-white/10 bg-black/25",
    layoutClass: ""
  },
  {
    to: "/player",
    title: "Join Session",
    description: "Enter an active session and follow the learner-facing prompts.",
    cta: "Join room",
    icon: Radio,
    iconClass: "text-scrub",
    cardClass: "border-white/10 bg-white/[0.025] hover:border-scrub/25 hover:bg-white/[0.045]",
    iconWrapClass: "border-white/10 bg-black/25",
    layoutClass: ""
  }
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-8 md:px-6 lg:py-10">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42 sm:text-sm sm:normal-case sm:tracking-normal">
          Nursing simulation training
        </p>
        <div className="mt-2.5 max-w-4xl">
          <h1 className="font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl md:text-6xl">
            Competency Stations
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-white/60 sm:text-base md:text-[17px] md:leading-7">
            Practice clinical scenarios, checkoffs, and troubleshooting independently or with an instructor.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.26 }}
      >
        <div className="mb-2.5 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">Choose a mode</span>
          <span className="h-px flex-1 bg-white/[0.07]" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className={`group flex min-h-[138px] flex-col justify-between rounded-xl border p-4 transition duration-200 sm:min-h-[146px] sm:p-5 ${action.cardClass} ${action.layoutClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg border sm:h-11 sm:w-11 ${action.iconWrapClass}`}>
                    <Icon className={`h-5 w-5 sm:h-[22px] sm:w-[22px] ${action.iconClass}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/20 transition duration-200 group-hover:translate-x-0.5 group-hover:text-white/55" />
                </div>

                <div className="mt-5">
                  <h2 className="text-base font-semibold text-white sm:text-lg">{action.title}</h2>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-white/52 sm:text-sm sm:leading-5">
                    {action.description}
                  </p>
                  <div className={`mt-3 text-xs font-semibold ${action.iconClass}`}>{action.cta}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-9 border-t border-white/[0.07] pt-7 sm:mt-10 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/36">Training library</div>
            <h2 className="mt-1.5 font-display text-3xl font-black leading-none text-white md:text-4xl">
              Competency Stations
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/52 sm:text-[15px]">
              Practice individually or open a station for a guided session.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-xs font-semibold tabular-nums text-white/55">
            {stations.length} stations
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stations.map((station) => (
          <div key={station.id} className="h-full">
            <StationCard
              station={station}
              showProgress={false}
              variant="home"
              onSelect={(selectedStation) => navigate(`/host?station=${selectedStation.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
