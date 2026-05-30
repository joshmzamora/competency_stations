import { motion } from "framer-motion";
import { Circle, Home, Sparkles, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatedButton } from "../components/AnimatedButton";
import { useAppChrome } from "../context/ChromeContext";
import { useEffect } from "react";

const shapes = [
  { label: "triangle", Icon: Triangle, className: "text-trauma", x: "9%", y: "14%", delay: 0 },
  { label: "star", Icon: Star, className: "text-amber", x: "72%", y: "12%", delay: 0.12 },
  { label: "umbrella", Icon: Umbrella, className: "text-white", x: "12%", y: "70%", delay: 0.24 },
  { label: "circle", Icon: Circle, className: "text-scrub", x: "78%", y: "68%", delay: 0.36 },
  { label: "square", Icon: Square, className: "text-monitor", x: "47%", y: "26%", delay: 0.48 }
];

function Cookie({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: [0, 1.08, 1], rotate: [18, -6, 0] }}
      transition={{ duration: 0.75, delay, ease: "easeOut" }}
      className="relative h-20 w-20 rounded-full border border-[#d49a57] bg-[#b87836] shadow-[inset_-10px_-12px_0_rgba(64,33,13,0.25),0_0_28px_rgba(255,176,32,0.22)]"
    >
      {[18, 34, 50, 62, 42, 25].map((left, index) => (
        <span
          key={index}
          className="absolute h-2.5 w-2.5 rounded-full bg-[#3a1f12]"
          style={{ left: `${left}%`, top: `${[24, 48, 30, 58, 70, 66][index]}%` }}
        />
      ))}
    </motion.div>
  );
}

export function CompletionPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = params.get("role") === "host" ? "host" : "player";
  const { setNavHidden } = useAppChrome();

  useEffect(() => {
    setNavHidden(true);
    return () => setNavHidden(false);
  }, [setNavHidden]);

  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[#070708] px-4 py-10 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,48,77,0.16),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:auto,70px_70px,70px_70px]" />
      {shapes.map(({ label, Icon, className, x, y, delay }) => (
        <motion.div
          key={label}
          className="pointer-events-none absolute grid h-40 w-40 place-items-center rounded-md border border-white/10 bg-black/25"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.74, rotate: -8 }}
          animate={{ opacity: 0.88, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay, ease: "easeOut" }}
        >
          <Icon className={`absolute h-28 w-28 ${className} opacity-55`} strokeWidth={1.7} />
          <Cookie delay={0.45 + delay} />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative z-10 grid w-full max-w-4xl place-items-center rounded-md border border-white/10 bg-black/72 px-6 py-10 shadow-[0_0_100px_rgba(255,48,77,0.16)] md:px-12 md:py-14"
      >
        <motion.img
          src="/favicon.png"
          alt="Competency Stations"
          className="h-24 w-24 rounded-2xl border border-white/15 bg-white p-2 shadow-[0_0_44px_rgba(255,255,255,0.18)]"
          initial={{ rotate: -8, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
        />
        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-4 py-2 font-display text-xs font-black uppercase tracking-[0.22em] text-amber">
          <Sparkles className="h-4 w-4" />
          Session closed
        </div>
        <h1 className="mt-5 font-display text-5xl font-black uppercase leading-none md:text-7xl">
          Competency Stations Completed!
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-xl leading-8 text-white/68">
          The room is closed, results are saved, and the final treat is officially unlocked.
        </p>
        <motion.div
          className="mt-8"
          animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cookie delay={0} />
        </motion.div>
        {role === "host" ? (
          <AnimatedButton variant="secondary" className="mt-9" onClick={() => navigate("/")}>
            <Home className="h-4 w-4" />
            Return to home
          </AnimatedButton>
        ) : (
          <div className="mt-9 rounded-md border border-scrub/25 bg-scrub/10 px-5 py-3 font-display text-sm font-black uppercase tracking-[0.16em] text-scrub">
            Enjoy your cookies.
          </div>
        )}
      </motion.div>
    </section>
  );
}
