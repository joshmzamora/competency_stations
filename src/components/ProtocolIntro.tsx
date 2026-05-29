import { AnimatePresence, motion } from "framer-motion";
import { Circle, Hexagon, Loader2, Pentagon, ShieldCheck, Square, Triangle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerShape, PlayerState } from "../types";

const ALL_SHAPES: PlayerShape[] = ["circle", "triangle", "square", "pentagon", "hexagon"];
const totalDurationMs = 22000;

type PhaseName = "boot" | "shuffle" | "reveal" | "brief";

function phaseForElapsed(elapsed: number): PhaseName {
  if (elapsed < 2800) return "boot";
  if (elapsed < 8200) return "shuffle";
  if (elapsed < 16500) return "reveal";
  return "brief";
}

function ShapeIcon({ shape, className }: { shape: PlayerShape; className?: string }) {
  switch (shape) {
    case "circle":
      return <Circle className={className} />;
    case "triangle":
      return <Triangle className={className} />;
    case "square":
      return <Square className={className} />;
    case "pentagon":
      return <Pentagon className={className} />;
    case "hexagon":
      return <Hexagon className={className} />;
  }
}

function shapeColor(shape: PlayerShape) {
  switch (shape) {
    case "circle":
      return "text-scrub";
    case "triangle":
      return "text-trauma";
    case "square":
      return "text-monitor";
    case "pentagon":
      return "text-amber";
    case "hexagon":
      return "text-white";
  }
}

function shapeRing(shape?: PlayerShape) {
  if (shape === "circle") return "border-scrub/60 shadow-[0_0_34px_rgba(36,245,199,0.22)]";
  if (shape === "triangle") return "border-trauma/65 shadow-[0_0_34px_rgba(255,48,77,0.24)]";
  if (shape === "square") return "border-monitor/60 shadow-[0_0_34px_rgba(110,247,255,0.2)]";
  if (shape === "pentagon") return "border-amber/60 shadow-[0_0_34px_rgba(255,176,32,0.2)]";
  if (shape === "hexagon") return "border-white/35 shadow-[0_0_34px_rgba(255,255,255,0.14)]";
  return "border-white/10";
}

function publicName(name: string) {
  const match = name.match(/\((.*)\)/);
  return match?.[1] || name;
}

function IdentityCard({ player, index, elapsed }: { player: PlayerState; index: number; elapsed: number }) {
  const revealAt = 9000 + index * 850;
  const isRevealed = elapsed >= revealAt;
  const placeholderShape = ALL_SHAPES[Math.floor((elapsed / 150 + index) % ALL_SHAPES.length)];
  const shape = player.shape ?? placeholderShape;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      className={`relative min-h-[210px] overflow-hidden rounded-md border bg-[#080b0f] p-5 text-center ${isRevealed ? shapeRing(player.shape) : "border-white/10"}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">Participant {index + 1}</div>
      <div className="mt-2 truncate font-display text-2xl font-black uppercase text-white">{publicName(player.name)}</div>

      <motion.div
        key={`${player.id}-${isRevealed ? player.shape : placeholderShape}`}
        initial={{ scale: 0.72, rotate: -8, opacity: 0 }}
        animate={{ scale: isRevealed ? 1 : 0.88, rotate: 0, opacity: isRevealed ? 1 : 0.32 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`mx-auto mt-7 flex justify-center ${isRevealed && player.shape ? shapeColor(player.shape) : "text-white/25"}`}
      >
        <ShapeIcon shape={shape} className="h-20 w-20" />
      </motion.div>

      <div className={`mt-5 font-display text-lg font-black uppercase tracking-[0.22em] ${isRevealed && player.shape ? shapeColor(player.shape) : "text-white/22"}`}>
        {isRevealed ? player.shape ?? "pending" : "assigning"}
      </div>
    </motion.div>
  );
}

export function ProtocolIntro({
  open,
  onComplete,
  startedAt,
  players
}: {
  open: boolean;
  onComplete: () => void;
  startedAt: number | null;
  serverTime?: number;
  players: PlayerState[];
}) {
  const [elapsed, setElapsed] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!open || !startedAt) {
      completedRef.current = false;
      setElapsed(0);
      return;
    }

    const tick = () => {
      const nextElapsed = Math.max(0, Date.now() - startedAt);
      setElapsed(nextElapsed);
      if (nextElapsed >= totalDurationMs && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    };

    tick();
    const id = window.setInterval(tick, 60);
    return () => window.clearInterval(id);
  }, [open, startedAt]);

  const phase = phaseForElapsed(elapsed);
  const progress = Math.min(100, (elapsed / totalDurationMs) * 100);
  const cyclingShape = ALL_SHAPES[Math.floor(elapsed / 130) % ALL_SHAPES.length];
  const revealedCount = useMemo(() => players.filter((_, index) => elapsed >= 9000 + index * 850).length, [elapsed, players]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="protocol-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[200] overflow-hidden bg-[#040507] text-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,48,77,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:46px_46px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,48,77,0.16),transparent_36%),radial-gradient(circle_at_50%_68%,rgba(36,245,199,0.08),transparent_38%)]" />

          <div className="relative grid h-screen grid-rows-[auto_1fr_auto] p-5 md:p-7">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="font-display text-xs font-bold uppercase tracking-[0.24em] text-trauma">Shape assignment protocol</div>
                <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none md:text-6xl">Identity Reveal</h2>
              </div>
              <div className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.045] px-4 py-3">
                <ShieldCheck className="h-6 w-6 text-scrub" />
                <div>
                  <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">Participants</div>
                  <div className="font-display text-2xl font-black text-white">{players.length}</div>
                </div>
              </div>
            </header>

            <main className="grid min-h-0 place-items-center py-6">
              <AnimatePresence mode="wait">
                {phase === "boot" && (
                  <motion.div
                    key="boot"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      className="mx-auto grid h-44 w-44 place-items-center rounded-full border border-trauma/45 bg-trauma/5"
                    >
                      <ShapeIcon shape={cyclingShape} className="h-24 w-24 text-trauma" />
                    </motion.div>
                    <div className="mt-8 font-display text-xs font-bold uppercase tracking-[0.45em] text-white/42">Initializing participant identities</div>
                  </motion.div>
                )}

                {phase === "shuffle" && (
                  <motion.div
                    key="shuffle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid w-full max-w-5xl gap-8"
                  >
                    <div className="text-center">
                      <div className="font-display text-xs font-bold uppercase tracking-[0.32em] text-monitor">Randomizing shape identifiers</div>
                      <h3 className="mt-3 font-display text-5xl font-black uppercase md:text-7xl">Stand By</h3>
                    </div>
                    <div className="flex justify-center gap-5">
                      {ALL_SHAPES.map((shape, index) => (
                        <motion.div
                          key={shape}
                          animate={{ y: [0, -18, 0], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.95, repeat: Infinity, delay: index * 0.11 }}
                          className="grid h-20 w-20 place-items-center rounded-md border border-white/10 bg-white/[0.045]"
                        >
                          <ShapeIcon shape={shape} className={`h-10 w-10 ${shapeColor(shape)}`} />
                        </motion.div>
                      ))}
                    </div>
                    <div className="mx-auto flex items-center gap-3 rounded-md border border-white/10 bg-black/35 px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-white/58">
                      <Loader2 className="h-4 w-4 animate-spin text-amber" />
                      Assignment in progress
                    </div>
                  </motion.div>
                )}

                {(phase === "reveal" || phase === "brief") && (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid w-full max-w-6xl gap-6"
                  >
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <div className="font-display text-xs font-bold uppercase tracking-[0.24em] text-trauma">
                          {phase === "reveal" ? "Reveal sequence active" : "Assignments locked"}
                        </div>
                        <h3 className="mt-2 font-display text-4xl font-black uppercase md:text-6xl">
                          {revealedCount}/{players.length} Revealed
                        </h3>
                      </div>
                      <div className="rounded-md border border-white/10 bg-white/[0.045] px-4 py-3 text-right">
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">Instruction</div>
                        <div className="text-sm text-white/72">Remember your shape. The host may call it during evaluation.</div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      {players.map((player, index) => (
                        <IdentityCard key={player.id} player={player} index={index} elapsed={elapsed} />
                      ))}
                    </div>

                    {phase === "brief" && (
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-md border border-trauma/25 bg-trauma/10 p-4 text-center"
                      >
                        <div className="font-display text-xl font-black uppercase tracking-[0.18em] text-trauma">Selection round ready</div>
                        <p className="mt-2 text-white/70">The evaluator can now trigger a participant selection from the host control panel.</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <footer className="grid gap-3 border-t border-white/10 pt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-trauma via-amber to-scrub" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                <span>Geometric identifier assignment</span>
                <span>{phase}</span>
              </div>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
