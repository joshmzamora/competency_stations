import { AnimatePresence, motion } from "framer-motion";
import { Circle, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PlayerShape, PlayerState, SelectionState } from "../types";

function ShapeIcon({ shape, className }: { shape: PlayerShape; className?: string }) {
  switch (shape) {
    case "circle":
      return <Circle className={className} />;
    case "triangle":
      return <Triangle className={className} />;
    case "square":
      return <Square className={className} />;
    case "star":
      return <Star className={className} />;
    case "umbrella":
      return <Umbrella className={className} />;
  }
}

function shapeColor(shape?: PlayerShape) {
  switch (shape) {
    case "circle":
      return "text-scrub";
    case "triangle":
      return "text-trauma";
    case "square":
      return "text-monitor";
    case "star":
      return "text-amber";
    case "umbrella":
      return "text-white";
    default:
      return "text-white/35";
  }
}

function shapeBorder(shape?: PlayerShape) {
  switch (shape) {
    case "circle":
      return "border-scrub/70 shadow-[0_0_50px_rgba(36,245,199,0.25)]";
    case "triangle":
      return "border-trauma/75 shadow-[0_0_50px_rgba(255,48,77,0.28)]";
    case "square":
      return "border-monitor/70 shadow-[0_0_50px_rgba(110,247,255,0.22)]";
    case "star":
      return "border-amber/70 shadow-[0_0_50px_rgba(255,176,32,0.22)]";
    case "umbrella":
      return "border-white/45 shadow-[0_0_50px_rgba(255,255,255,0.12)]";
    default:
      return "border-white/10";
  }
}

function publicName(name?: string) {
  if (!name) return "Unknown";
  const match = name.match(/\((.*)\)/);
  return match?.[1] || name;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function RouletteBar({ players, highlightIndex }: { players: PlayerState[]; highlightIndex: number }) {
  if (players.length === 0) return null;
  const repeated = [...players, ...players, ...players, ...players, ...players];
  const centerIndex = players.length * 2 + (highlightIndex % players.length);

  return (
    <div className="relative h-32 w-full max-w-4xl overflow-hidden rounded-md border border-white/10 bg-[#05070a]">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-[180px] -translate-x-1/2 border-x border-trauma/70 bg-trauma/10 shadow-[0_0_34px_rgba(255,48,77,0.22)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05070a] via-transparent to-[#05070a]" />

      <motion.div
        className="flex h-full items-center gap-4 px-8"
        animate={{ x: `calc(50% - ${centerIndex * 188 + 94}px)` }}
        transition={{ type: "spring", stiffness: 170, damping: 24, mass: 0.85 }}
      >
        {repeated.map((player, index) => {
          const active = index === centerIndex;
          return (
            <motion.div
              key={`${player.id}-${index}`}
              animate={{ scale: active ? 1.08 : 0.9, opacity: active ? 1 : 0.32 }}
              className={`grid h-24 min-w-[188px] flex-shrink-0 place-items-center rounded-md border bg-white/[0.035] px-4 ${
                active ? shapeBorder(player.shape) : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {player.shape && <ShapeIcon shape={player.shape} className={`h-9 w-9 ${shapeColor(player.shape)}`} />}
                <div className="min-w-0 text-left">
                  <div className="truncate font-display text-lg font-black uppercase text-white">{publicName(player.name)}</div>
                  <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">Turns {player.turnCount}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function SelectionRoulette({
  selection,
  players,
  clientId
}: {
  selection: SelectionState | null;
  serverTime?: number;
  players: PlayerState[];
  clientId: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!selection) {
      setElapsed(0);
      return;
    }

    let frame = 0;
    const tick = () => {
      setElapsed(Math.max(0, Date.now() - selection.startedAt));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [selection?.startedAt, selection]);

  const targetIndex = selection ? players.findIndex((player) => player.id === selection.playerId) : -1;
  const targetPlayer = targetIndex >= 0 ? players[targetIndex] : undefined;
  const progress = selection ? Math.min(elapsed / selection.durationMs, 1) : 0;
  const resultVisible = progress >= 1;
  const amISelected = Boolean(clientId && selection?.playerId.startsWith(clientId));

  const highlightIndex = useMemo(() => {
    if (!selection || players.length === 0) return 0;
    if (resultVisible && targetIndex >= 0) return targetIndex;
    const rounds = players.length * 6 + Math.max(0, targetIndex);
    return Math.round(easeOutCubic(progress) * rounds) % players.length;
  }, [players.length, progress, resultVisible, selection, targetIndex]);

  if (!selection) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="selection-roulette"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[200] overflow-hidden bg-[#030406] text-white"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,48,77,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,48,77,0.16),transparent_34%),radial-gradient(circle_at_50%_70%,rgba(36,245,199,0.08),transparent_36%)]" />

        {amISelected && resultVisible && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-10 border-[14px] border-trauma"
            animate={{ opacity: [0.95, 0.28, 0.95] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}

        <div className="relative grid h-screen place-items-center p-5">
          <AnimatePresence mode="wait">
            {!resultVisible ? (
              <motion.div
                key="spin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid w-full justify-items-center gap-7"
              >
                <div className="text-center">
                  <div className="font-display text-xs font-bold uppercase tracking-[0.36em] text-trauma">Random participant selection</div>
                  <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none md:text-6xl">Selecting</h2>
                </div>

                <RouletteBar players={players} highlightIndex={highlightIndex} />

                <div className="h-2 w-full max-w-3xl overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-trauma via-amber to-scrub" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 230, damping: 22 }}
                className="grid justify-items-center gap-5 text-center"
              >
                <div>
                  <div className="font-display text-xs font-bold uppercase tracking-[0.38em] text-amber">Selection locked</div>
                  <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none md:text-7xl">
                    {amISelected ? "You Are Up" : "Stand By"}
                  </h2>
                </div>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-[min(86vw,380px)] rounded-md border bg-white/[0.045] p-7 ${shapeBorder(targetPlayer?.shape)}`}
                >
                  {targetPlayer?.shape && (
                    <motion.div
                      initial={{ scale: 0.65, rotate: -16 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className={`mx-auto flex justify-center ${shapeColor(targetPlayer.shape)}`}
                    >
                      <ShapeIcon shape={targetPlayer.shape} className="h-28 w-28" />
                    </motion.div>
                  )}
                  <div className="mt-5 font-display text-3xl font-black uppercase text-white">{publicName(targetPlayer?.name)}</div>
                  <div className={`mt-2 font-display text-lg font-black uppercase tracking-[0.2em] ${shapeColor(targetPlayer?.shape)}`}>
                    {targetPlayer?.shape ?? "unassigned"}
                  </div>
                </motion.div>

                <p className="max-w-lg text-base leading-7 text-white/65">
                  {amISelected
                    ? "Prepare to respond or perform the next competency action. The evaluator will proceed from the host panel."
                    : "Observe the selected participant and wait for your shape to be called."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
