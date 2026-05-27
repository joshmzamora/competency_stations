import { AnimatePresence, motion } from "framer-motion";
import { Circle, Loader2, Shield, ShieldAlert, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PlayerShape, PlayerState } from "../types";

const ALL_SHAPES: PlayerShape[] = ["circle", "triangle", "square", "star", "umbrella"];

// Phase boundaries in milliseconds
const PHASES = [
  { name: "glitch",       end: 1500  },
  { name: "title",        end: 4500  },
  { name: "assigning",    end: 7500  },
  { name: "cycling",      end: 12000 },
  { name: "resolved",     end: 18000 },
  { name: "instructions", end: 23000 },
] as const;

type PhaseName = typeof PHASES[number]["name"];

function ShapeIcon({ shape, className }: { shape: PlayerShape; className?: string }) {
  switch (shape) {
    case "circle":   return <Circle   className={className} />;
    case "triangle": return <Triangle className={className} />;
    case "square":   return <Square   className={className} />;
    case "star":     return <Star     className={className} />;
    case "umbrella": return <Umbrella className={className} />;
  }
}

function shapeColor(shape: PlayerShape) {
  switch (shape) {
    case "circle":   return "text-scrub";
    case "triangle": return "text-trauma";
    case "square":   return "text-monitor";
    case "star":     return "text-amber";
    case "umbrella": return "text-white";
  }
}

export function ProtocolIntro({
  open,
  onComplete,
  startedAt,
  players,
}: {
  open: boolean;
  onComplete: () => void;
  startedAt: number | null;
  serverTime?: number; // kept for API compat but unused (same machine)
  players: PlayerState[];
}) {
  const [phase, setPhase]   = useState<PhaseName>("glitch");
  const [elapsed, setElapsed] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!open || !startedAt) {
      setPhase("glitch");
      setElapsed(0);
      return;
    }

    const tick = () => {
      const ms = Math.max(0, Date.now() - startedAt);
      setElapsed(ms);

      const currentPhase = PHASES.find(p => ms < p.end);
      if (currentPhase) {
        setPhase(currentPhase.name);
      } else {
        // Sequence complete
        onCompleteRef.current();
      }
    };

    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [open, startedAt]);

  const cyclingShape = ALL_SHAPES[Math.floor(elapsed / 180) % ALL_SHAPES.length];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="protocol-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#04060a] text-white"
        >
          {/* Deep crimson radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(160,20,40,0.18)_0%,transparent_70%)]" />
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-30"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)" }}
          />

          <AnimatePresence mode="wait">
            {phase === "glitch" && (
              <motion.div
                key="glitch"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.2, 1, 0.5, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="h-28 w-28 border-2 border-trauma flex items-center justify-center"
                  style={{ animation: "pulse 1s ease-in-out infinite" }}>
                  <ShieldAlert className="h-14 w-14 text-trauma" />
                </div>
                <p className="font-display text-sm font-bold uppercase tracking-[0.5em] text-trauma">
                  ⚠ System Override Detected ⚠
                </p>
              </motion.div>
            )}

            {phase === "title" && (
              <motion.div
                key="title"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.08 }}
                transition={{ duration: 0.9 }}
                className="flex flex-col items-center gap-6 text-center"
              >
                <motion.p
                  className="font-display text-xs font-bold uppercase tracking-[0.6em] text-amber"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  Authorization Confirmed
                </motion.p>
                <h1 className="font-display text-7xl font-black uppercase leading-none tracking-tighter md:text-9xl">
                  The Squid Game<br />
                  <span className="text-trauma">Protocol</span>
                </h1>
                <p className="font-display text-xs tracking-[0.3em] text-white/30 uppercase">
                  Competency Trial Initialization
                </p>
              </motion.div>
            )}

            {phase === "assigning" && (
              <motion.div
                key="assigning"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-10"
              >
                <Loader2 className="h-20 w-20 animate-spin text-monitor" />
                <p className="font-display text-3xl font-black uppercase tracking-widest text-monitor animate-pulse">
                  Assigning Identities…
                </p>
                <div className="flex gap-6">
                  {ALL_SHAPES.map(s => (
                    <ShapeIcon key={s} shape={s} className="h-10 w-10 text-white/15" />
                  ))}
                </div>
              </motion.div>
            )}

            {phase === "cycling" && (
              <motion.div key="cycling" className="flex flex-col items-center gap-12 px-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                >
                  <ShapeIcon shape={cyclingShape} className="h-48 w-48 text-white/25" />
                </motion.div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {players.map(p => (
                    <div key={p.id} className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-4 text-center min-w-[120px]">
                      <p className="text-[9px] text-white/35 uppercase tracking-widest truncate w-full">{p.name}</p>
                      <Loader2 className="h-5 w-5 animate-spin text-amber" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === "resolved" && (
              <motion.div
                key="resolved"
                className="flex flex-col items-center gap-8 w-full max-w-5xl px-4"
              >
                <div className="text-center">
                  <p className="font-display text-xl font-black uppercase tracking-widest text-trauma">
                    Identities Confirmed
                  </p>
                  <div className="mx-auto mt-2 h-px w-40 bg-trauma opacity-60" />
                </div>

                <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {players.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.35, duration: 0.5 }}
                      className="relative overflow-hidden rounded-xl border-2 border-white/10 bg-[#090b0f] p-6 text-center"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-trauma to-transparent opacity-60" />
                      <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">{p.name}</p>
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 22, delay: i * 0.35 + 0.15 }}
                        className={`mx-auto mb-4 flex justify-center ${p.shape ? shapeColor(p.shape) : ""}`}
                      >
                        {p.shape && <ShapeIcon shape={p.shape} className="h-20 w-20" />}
                      </motion.div>
                      <p className={`font-display text-2xl font-black uppercase tracking-widest ${p.shape ? shapeColor(p.shape) : "text-white/20"}`}>
                        {p.shape ?? "—"}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === "instructions" && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex max-w-xl flex-col items-center gap-8 px-6 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="h-16 w-16 text-trauma" />
                </motion.div>
                <h2 className="font-display text-4xl font-black uppercase">Memorize Your Shape</h2>
                <p className="text-lg leading-relaxed text-white/65 italic">
                  "The evaluator will randomly call participants for trial. Your shape is your identifier.
                  Failure to respond will result in clinical disqualification."
                </p>
                <div className="mt-2 h-px w-full overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-px bg-trauma"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 4.5, ease: "linear" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-white/15">
            <span>Protocol // {players.length} Participants</span>
            <span>{Math.max(0, Math.round(elapsed / 1000))}s</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
