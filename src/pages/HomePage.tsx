import { motion } from "framer-motion";
import { MonitorPlay, Radio, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { StationCard } from "../components/StationCard";
import { stations } from "../data/stations";

const actions = [
  {
    to: "/solo",
    title: "Practice Solo",
    description: "Complete stations independently with scoring and feedback.",
    cta: "Start practice →",
    icon: UserRound,
    iconClass: "text-monitor",
    edgeClass: "border-l-monitor/70",
    cardClass: "border-monitor/18 bg-monitor/[0.04] hover:border-monitor/30 hover:bg-monitor/[0.055]",
    layoutClass: "col-span-2 lg:col-span-1"
  },
  {
    to: "/host",
    title: "Host Session",
    description: "Run a guided competency checkoff.",
    cta: null,
    icon: MonitorPlay,
    iconClass: "text-trauma",
    edgeClass: "border-l-trauma/60",
    cardClass: "border-white/[0.09] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.035]",
    layoutClass: ""
  },
  {
    to: "/player",
    title: "Join Session",
    description: "Enter a room code and join a session.",
    cta: null,
    icon: Radio,
    iconClass: "text-scrub",
    edgeClass: "border-l-scrub/60",
    cardClass: "border-white/[0.09] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.035]",
    layoutClass: ""
  }
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-7 md:px-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">
          Nursing simulation training
        </p>
        <div className="mt-2 max-w-4xl">
          <h1 className="font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl md:text-6xl">
            Competency Stations
          </h1>
          <p className="mt-2.5 max-w-3xl text-[15px] leading-6 text-white/60 sm:text-base md:text-[17px] md:leading-7">
            Practice clinical scenarios, checkoffs, and troubleshooting independently or with an instructor.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="mt-5"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.035, duration: 0.22 }}
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
                className={`group flex min-h-[112px] flex-col justify-between rounded-lg border border-l-2 p-4 transition duration-200 sm:min-h-[118px] ${action.edgeClass} ${action.cardClass} ${action.layoutClass}`}
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 flex-none place-items-center rounded-md border border-white/[0.09] bg-black/25">
                    <Icon className={`h-[18px] w-[18px] ${action.iconClass}`} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h2 className="text-base font-semibold leading-5 text-white sm:text-lg">{action.title}</h2>
                    <p className="mt-1 line-clamp-1 text-[13px] leading-5 text-white/50 sm:text-sm">
                      {action.description}
                    </p>
                  </div>
                </div>

                {action.cta ? (
                  <div className={`mt-3 pl-12 text-xs font-semibold ${action.iconClass}`}>{action.cta}</div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-8 border-t border-white/[0.07] pt-6 sm:mt-9 sm:pt-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-black leading-none text-white md:text-4xl">
              Competency Stations
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/52 sm:text-[15px]">
              Practice individually or open a station for an instructor-led session.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold tabular-nums text-white/52">
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
