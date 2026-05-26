import { motion } from "framer-motion";
import { BookOpen, BrainCircuit, MonitorPlay, Radio, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { to: "/host", label: "Start Host Mode", icon: MonitorPlay, accent: "text-trauma" },
  { to: "/player", label: "Start Player Mode", icon: Radio, accent: "text-scrub" },
  { to: "/study", label: "Study Flashcards", icon: BookOpen, accent: "text-monitor" },
  { to: "/results", label: "View Results", icon: Trophy, accent: "text-amber" }
];

export function HomePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-3 rounded-md border border-trauma/30 bg-trauma/10 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-trauma">
          <BrainCircuit className="h-4 w-4" />
          Local medical challenge
        </div>
        <h1 className="mt-6 max-w-4xl font-display text-5xl font-black uppercase leading-[0.92] tracking-normal text-white md:text-7xl">
          Competency Stations
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
          A dramatic local-network review game for clinical competencies. Host the board on one computer, connect from another
          browser on the same Wi-Fi, and run the room without cloud services or accounts.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.06 }}
              >
                <Link
                  to={action.to}
                  className="group flex min-h-24 items-center justify-between rounded-md border border-white/10 bg-white/[0.045] p-4 transition hover:border-scrub/40 hover:bg-scrub/10"
                >
                  <span className="font-display text-xl font-bold uppercase tracking-[0.08em] text-white">{action.label}</span>
                  <Icon className={`h-7 w-7 ${action.accent} transition group-hover:scale-110`} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="relative min-h-[480px] overflow-hidden rounded-md border border-scrub/25 bg-black/55 p-5 shadow-scrub"
      >
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0_45%,rgba(36,245,199,0.08)_45%_46%,transparent_46%_100%)]" />
        <div className="relative grid h-full content-between gap-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-scrub">Monitor board</div>
            <div className="h-3 w-3 animate-pulse rounded-full bg-trauma shadow-alert" />
          </div>
          <div className="grid gap-3">
            {["Code Blue", "Stroke", "Chest tube", "CAUTI/CLABSI prevention"].map((station, index) => (
              <div key={station} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-white/10 bg-panel/70 p-4">
                <div>
                  <div className="font-display text-xs uppercase tracking-[0.18em] text-white/40">Station {index + 1}</div>
                  <div className="mt-1 font-display text-2xl font-bold text-white">{station}</div>
                </div>
                <div className={index % 2 ? "text-scrub" : "text-trauma"}>
                  <svg viewBox="0 0 120 36" className="h-9 w-28" aria-hidden="true">
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      points="0,20 16,20 24,8 34,30 45,18 60,18 70,6 82,30 94,20 120,20"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["Wi-Fi", "WebSocket", "JSON"].map((label) => (
              <div key={label} className="rounded-md border border-monitor/25 bg-monitor/10 p-3 text-center font-display text-xs font-bold uppercase tracking-[0.16em] text-monitor">
                {label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
