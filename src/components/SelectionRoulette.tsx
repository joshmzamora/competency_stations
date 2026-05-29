import { AnimatePresence, motion } from "framer-motion";
import { Circle, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useEffect, useState } from "react";
import type { PlayerShape, PlayerState, SelectionState } from "../types";

const cardWidth = 204;
const cardGap = 16;
const cardStride = cardWidth + cardGap;

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

function RouletteBar({ players, reelPosition }: { players: PlayerState[]; reelPosition: number }) {
  if (players.length === 0) return null;
  const repeatCount = 11;
  const repeated = Array.from({ length: repeatCount }, () => players).flat();
  const baseIndex = players.length * 2;
  const centerPosition = baseIndex + reelPosition;
  const activeIndex = Math.round(centerPosition);
  const translateX = `calc(50% - ${centerPosition * cardStride + cardWidth / 2}px)`;
  const maxTurns = Math.max(1, ...players.map((player) => player.turnCount));

  return (
    <div className="relative h-36 w-full max-w-4xl overflow-hidden rounded-md border border-white/10 bg-[#05070a] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#05070a] via-transparent to-[#05070a]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-[216px] -translate-x-1/2 border-x border-trauma/80 bg-trauma/[0.055] shadow-[0_0_44px_rgba(255,48,77,0.24)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-40 h-0 w-0 -translate-x-1/2 border-l-[13px] border-r-[13px] border-t-[18px] border-l-transparent border-r-transparent border-t-trauma" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-40 h-0 w-0 -translate-x-1/2 border-b-[18px] border-l-[13px] border-r-[13px] border-b-trauma border-l-transparent border-r-transparent" />
      <div className="pointer-events-none absolute inset-y-4 left-1/2 z-40 w-px -translate-x-1/2 bg-trauma/70 shadow-[0_0_18px_rgba(255,48,77,0.7)]" />

      <div
        className="relative z-20 flex h-full items-center gap-4 px-8"
        style={{ transform: `translateX(${translateX})`, willChange: "transform" }}
      >
        {repeated.map((player, index) => {
          const distance = Math.min(1.8, Math.abs(index - centerPosition));
          const focus = Math.max(0, 1 - distance / 1.8);
          const active = index === activeIndex;
          return (
            <div
              key={`${player.id}-${index}`}
              style={{
                opacity: 0.26 + focus * 0.74,
                transform: `scale(${0.88 + focus * 0.16})`,
                willChange: "opacity, transform",
                zIndex: active ? 5 : Math.round(focus * 4)
              }}
              className={`grid h-24 min-w-[204px] flex-shrink-0 place-items-center rounded-md border px-4 transition-colors ${
                active ? `${shapeBorder(player.shape)} bg-white/[0.095]` : "border-white/10 bg-white/[0.035]"
              }`}
            >
              <div className="flex items-center gap-3">
                {player.shape && <ShapeIcon shape={player.shape} className={`h-9 w-9 ${shapeColor(player.shape)}`} />}
                <div className="min-w-0 text-left">
                  <div className="truncate font-display text-lg font-black uppercase text-white">{publicName(player.name)}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-white/35" style={{ width: `${Math.max(18, (player.turnCount / maxTurns) * 100)}%` }} />
                    </div>
                    <div className="font-display text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
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

  const reelPosition = (() => {
    if (!selection || players.length === 0) return 0;
    const targetOffset = Math.max(0, targetIndex);
    const totalDistance = players.length * 6 + targetOffset;
    return resultVisible ? totalDistance : easeOutCubic(progress) * totalDistance;
  })();

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

                <RouletteBar players={players} reelPosition={reelPosition} />

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
