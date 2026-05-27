import { AnimatePresence, motion } from "framer-motion";
import { Circle, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PlayerShape, PlayerState, SelectionState } from "../types";

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

function shapeBorder(shape: PlayerShape) {
  switch (shape) {
    case "circle":   return "border-scrub shadow-[0_0_30px_rgba(34,245,199,0.4)]";
    case "triangle": return "border-trauma shadow-[0_0_30px_rgba(220,38,38,0.4)]";
    case "square":   return "border-monitor shadow-[0_0_30px_rgba(100,180,255,0.4)]";
    case "star":     return "border-amber shadow-[0_0_30px_rgba(250,190,50,0.4)]";
    case "umbrella": return "border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]";
  }
}

/** Spinning roulette item list — loops through all players */
function RouletteBar({ players, highlightIdx }: { players: PlayerState[]; highlightIdx: number }) {
  if (players.length === 0) return null;
  // Build a repeated list so we can show prev/current/next items
  const repeated = [...players, ...players, ...players];
  const offset = highlightIdx % players.length + players.length; // index within repeated

  return (
    <div className="relative h-28 w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-black/50">
      {/* Center highlight stripe */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-[200px] -translate-x-1/2 border-x-2 border-monitor bg-monitor/5" />

      {/* Scrolling track */}
      <motion.div
        className="flex h-full items-center gap-6 px-8"
        animate={{ x: `calc(50% - ${offset * 220 + 100}px)` }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
      >
        {repeated.map((p, i) => {
          const isActive = i === offset;
          return (
            <div
              key={`${p.id}-${i}`}
              className={`flex min-w-[200px] flex-shrink-0 flex-col items-center gap-2 rounded-lg border px-4 py-3 transition-all duration-100 ${
                isActive
                  ? "border-monitor/60 bg-monitor/10 scale-110"
                  : "border-white/5 opacity-30 scale-90"
              }`}
            >
              {p.shape && (
                <ShapeIcon shape={p.shape as PlayerShape} className={`h-8 w-8 ${isActive ? shapeColor(p.shape as PlayerShape) : "text-white/20"}`} />
              )}
              <span className="truncate text-center text-[10px] font-bold uppercase tracking-wider">
                {p.name}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function SelectionRoulette({
  selection,
  players,
  clientId,
}: {
  selection: SelectionState | null;
  serverTime?: number; // kept for API compat, unused (same machine)
  players: PlayerState[];
  clientId: string;
}) {
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [isDone, setIsDone]             = useState(false);
  const prevSelectionRef = useRef<SelectionState | null>(null);

  useEffect(() => {
    // Reset on new selection
    if (!selection) {
      setIsDone(false);
      setHighlightIdx(0);
      prevSelectionRef.current = null;
      return;
    }

    // If same selection already done, skip re-running
    if (prevSelectionRef.current?.startedAt === selection.startedAt && isDone) return;
    prevSelectionRef.current = selection;
    setIsDone(false);

    const finalIdx = players.findIndex(p => p.id === selection.playerId);

    const tick = () => {
      const elapsed = Date.now() - selection.startedAt;
      const progress = Math.min(elapsed / selection.durationMs, 1);

      if (progress >= 1) {
        setIsDone(true);
        if (finalIdx !== -1) setHighlightIdx(finalIdx + players.length); // point into middle of repeated list
        return;
      }

      // Speed: starts at 40ms per step, slows to ~600ms as progress→1
      const stepMs = 40 + Math.pow(progress, 2.5) * 560;
      setHighlightIdx(prev => prev + 1);
      setTimeout(tick, stepMs);
    };

    const initial = setTimeout(tick, 40);
    return () => clearTimeout(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.startedAt]);

  if (!selection) return null;

  const targetPlayer = players.find(p => p.id === selection.playerId);
  // Player is "selected" if they share the same client connection prefix
  const amISelected = clientId ? selection.playerId.startsWith(clientId) : false;

  return (
    <AnimatePresence>
      <motion.div
        key="selection-roulette"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-black/96 backdrop-blur-xl"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,245,199,0.06)_0%,transparent_65%)]" />

        <AnimatePresence mode="wait">
          {!isDone ? (
            /* ──── SPINNING PHASE ──── */
            <motion.div
              key="spinning"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex w-full max-w-3xl flex-col items-center gap-10 px-4"
            >
              <div className="text-center">
                <motion.p
                  className="font-display text-xs font-bold uppercase tracking-[0.5em] text-monitor"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  Participant Selection // Protocol Active
                </motion.p>
                <h2 className="mt-3 font-display text-5xl font-black uppercase tracking-tighter text-white">
                  Selecting Participant…
                </h2>
              </div>

              <RouletteBar players={players} highlightIdx={highlightIdx} />

              <p className="font-display text-xs uppercase tracking-[0.35em] text-white/25">
                Synchronizing Clinical Evaluation Target
              </p>
            </motion.div>
          ) : (
            /* ──── RESULT PHASE ──── */
            <motion.div
              key="result"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="flex flex-col items-center gap-8 px-6 text-center"
            >
              {/* Fullscreen border pulse for selected player */}
              {amISelected && (
                <motion.div
                  className="pointer-events-none fixed inset-0 border-[16px] border-trauma z-10"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}

              <p className="font-display text-xs font-bold uppercase tracking-[0.5em] text-amber">
                Selection Locked
              </p>

              {/* Target player identity card */}
              <div className={`rounded-2xl border-4 bg-white/5 p-10 ${
                targetPlayer?.shape ? shapeBorder(targetPlayer.shape as PlayerShape) : "border-white/10"
              }`}>
                {targetPlayer?.shape && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`mx-auto mb-6 flex justify-center ${shapeColor(targetPlayer.shape as PlayerShape)}`}
                  >
                    <ShapeIcon shape={targetPlayer.shape as PlayerShape} className="h-40 w-40" />
                  </motion.div>
                )}
                <h3 className="font-display text-5xl font-black uppercase text-white">
                  {targetPlayer?.name ?? "Unknown"}
                </h3>
              </div>

              <div className="flex flex-col items-center gap-3">
                {amISelected ? (
                  <motion.p
                    className="font-display text-3xl font-black uppercase text-trauma"
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⚡ You Have Been Selected
                  </motion.p>
                ) : (
                  <p className="font-display text-2xl font-black uppercase text-white/30">
                    Stand By
                  </p>
                )}
                <p className="max-w-sm text-sm text-white/50">
                  {amISelected
                    ? "Prepare to demonstrate competency. The evaluator is awaiting your response."
                    : "Observe the trial. Await your own selection."}
                </p>
              </div>

              {/* Auto-dismiss progress bar */}
              <div className="mt-4 h-px w-64 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={`h-full ${amISelected ? "bg-trauma" : "bg-monitor"}`}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 8, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
