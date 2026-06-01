import { AnimatePresence, motion } from "framer-motion";
import { Circle, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerShape, PlayerState } from "../types";
import { PhaseBrief } from "./PhaseBrief";

const ALL_SHAPES: PlayerShape[] = ["triangle", "star", "umbrella", "circle", "square"];
const totalDurationMs = 22000;
const introAudioSrc = "/audio/squid_game_choosing_shapes.mp3";
const maxVolume = 0.15;
const fadeOutMs = 2200;
const openingMs = 5200;
const closingMs = 1600;

function segmentMs(playerCount: number) {
  return Math.max(2600, (totalDurationMs - openingMs - closingMs) / Math.max(1, playerCount));
}

function revealAt(index: number, playerCount: number) {
  return openingMs + index * segmentMs(playerCount);
}

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

function shapeColor(shape: PlayerShape) {
  switch (shape) {
    case "triangle":
      return "text-trauma";
    case "star":
      return "text-amber";
    case "umbrella":
      return "text-white";
    case "circle":
      return "text-scrub";
    case "square":
      return "text-monitor";
  }
}

function shapeRing(shape?: PlayerShape) {
  if (shape === "triangle") return "border-trauma/70 shadow-[0_0_70px_rgba(255,48,77,0.28)]";
  if (shape === "star") return "border-amber/70 shadow-[0_0_70px_rgba(255,176,32,0.24)]";
  if (shape === "umbrella") return "border-white/45 shadow-[0_0_70px_rgba(255,255,255,0.14)]";
  if (shape === "circle") return "border-scrub/65 shadow-[0_0_70px_rgba(36,245,199,0.22)]";
  if (shape === "square") return "border-monitor/65 shadow-[0_0_70px_rgba(110,247,255,0.2)]";
  return "border-white/10";
}

function publicName(name: string) {
  const match = name.match(/\((.*)\)/);
  return match?.[1] || name;
}

function activeIndexForElapsed(elapsed: number, playerCount: number) {
  if (elapsed < openingMs || playerCount === 0) return -1;
  return Math.min(playerCount - 1, Math.floor((elapsed - openingMs) / segmentMs(playerCount)));
}

function MiniRoster({ players, activeIndex, elapsed }: { players: PlayerState[]; activeIndex: number; elapsed: number }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {players.map((player, index) => {
        const revealed = elapsed >= revealAt(index, players.length) + segmentMs(players.length) * 0.34;
        const active = index === activeIndex;
        const shape = player.shape;
        return (
          <motion.div
            key={player.id}
            animate={{ opacity: active || revealed ? 1 : 0.38, y: active ? -4 : 0 }}
            className={`rounded-md border bg-black/35 px-3 py-2 ${active ? shapeRing(shape) : "border-white/10"}`}
          >
            <div className="flex items-center gap-2">
              {shape && <ShapeIcon shape={shape} className={`h-5 w-5 ${revealed ? shapeColor(shape) : "text-white/25"}`} />}
              <div className="min-w-0">
                <div className="truncate font-display text-xs font-black uppercase text-white">{publicName(player.name)}</div>
                <div className={`font-display text-[9px] font-bold uppercase tracking-[0.16em] ${revealed && shape ? shapeColor(shape) : "text-white/28"}`}>
                  {revealed ? shape ?? "pending" : active ? "revealing" : "stand by"}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function FeaturedReveal({ player, index, elapsed, playerCount }: { player: PlayerState; index: number; elapsed: number; playerCount: number }) {
  const shape = player.shape;
  const localElapsed = Math.max(0, elapsed - revealAt(index, playerCount));
  const revealShape = localElapsed >= segmentMs(playerCount) * 0.34;
  const cyclingShape = ALL_SHAPES[Math.floor(elapsed / 110) % ALL_SHAPES.length];
  const displayedShape = revealShape && shape ? shape : cyclingShape;

  return (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, scale: 0.92, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.04, y: -24 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
      className="grid w-full max-w-5xl justify-items-center text-center"
    >
      <div className="font-display text-sm font-bold uppercase tracking-[0.34em] text-trauma">Participant {index + 1}</div>
      <h3 className="mt-4 font-display text-7xl font-black uppercase leading-none text-white md:text-9xl">{publicName(player.name)}</h3>

      <motion.div
        key={revealShape ? `${player.id}-${shape}` : displayedShape}
        initial={{ scale: 0.72, rotate: -18, opacity: 0 }}
        animate={{ scale: revealShape ? 1 : 0.82, rotate: revealShape ? 0 : [0, 8, -8, 0], opacity: revealShape ? 1 : 0.38 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`mt-12 grid h-72 w-72 place-items-center rounded-md border bg-black/45 md:h-96 md:w-96 ${revealShape ? shapeRing(shape) : "border-white/10"
          }`}
      >
        <ShapeIcon shape={displayedShape} className={`h-44 w-44 md:h-64 md:w-64 ${revealShape && shape ? shapeColor(shape) : "text-white/25"}`} />
      </motion.div>

      <div className={`mt-9 font-display text-5xl font-black uppercase tracking-[0.24em] md:text-7xl ${revealShape && shape ? shapeColor(shape) : "text-white/28"}`}>
        {revealShape ? shape ?? "pending" : "assigning"}
      </div>
    </motion.div>
  );
}

function AssignmentSummary({ players }: { players: PlayerState[] }) {
  return (
    <motion.div
      key="assignment-summary"
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -22, scale: 1.02 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
      className="grid w-full max-w-6xl justify-items-center gap-7 text-center"
    >
      <div>
        <div className="font-display text-xs font-bold uppercase tracking-[0.36em] text-scrub">Assignments locked</div>
        <h3 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white md:text-7xl">All Shapes Assigned</h3>
      </div>
      <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: index * 0.08 }}
            className={`rounded-md border bg-black/45 p-4 ${shapeRing(player.shape)}`}
          >
            {player.shape && <ShapeIcon shape={player.shape} className={`mx-auto h-16 w-16 ${shapeColor(player.shape)}`} />}
            <div className="mt-3 truncate font-display text-lg font-black uppercase text-white">{publicName(player.name)}</div>
            <div className={`mt-1 font-display text-xs font-black uppercase tracking-[0.2em] ${player.shape ? shapeColor(player.shape) : "text-white/30"}`}>
              {player.shape ?? "pending"}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function ProtocolIntro({
  open,
  onComplete,
  onSkip,
  canSkip = false,
  startedAt,
  players
}: {
  open: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  startedAt: number | null;
  serverTime?: number;
  players: PlayerState[];
}) {
  const [elapsed, setElapsed] = useState(0);
  const completedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    const id = window.setInterval(tick, 40);
    return () => window.clearInterval(id);
  }, [open, startedAt]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!open || !audio) return;

    const started = startedAt ?? Date.now();
    const syncAudio = () => {
      const syncedElapsed = Math.min(totalDurationMs, Math.max(0, Date.now() - started));
      const targetTime = syncedElapsed / 1000;
      const remaining = Math.max(0, totalDurationMs - syncedElapsed);
      audio.volume = Math.min(maxVolume, maxVolume * (remaining / fadeOutMs));
      if (Number.isFinite(targetTime) && Math.abs(audio.currentTime - targetTime) > 0.35) {
        audio.currentTime = targetTime;
      }
    };

    audio.loop = false;
    audio.volume = maxVolume;
    syncAudio();
    const playPromise = audio.play();
    if (playPromise) playPromise.catch(() => undefined);
    const volumeId = window.setInterval(syncAudio, 80);

    return () => {
      window.clearInterval(volumeId);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [open, startedAt]);

  const progress = Math.min(100, (elapsed / totalDurationMs) * 100);
  const activeIndex = activeIndexForElapsed(elapsed, players.length);
  const activePlayer = activeIndex >= 0 ? players[activeIndex] : undefined;
  const openingShape = ALL_SHAPES[Math.floor(elapsed / 105) % ALL_SHAPES.length];
  const assignedCount = useMemo(
    () => players.filter((_, index) => elapsed >= revealAt(index, players.length) + segmentMs(players.length) * 0.34).length,
    [elapsed, players]
  );
  const showSummary = players.length > 0 && elapsed >= totalDurationMs - closingMs;

  function stopAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="protocol-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[200] overflow-hidden bg-[#030406] text-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,48,77,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,48,77,0.2),transparent_35%),radial-gradient(circle_at_50%_76%,rgba(36,245,199,0.08),transparent_42%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-trauma/16 to-transparent" />

          <div className="relative grid h-screen grid-rows-[auto_1fr_auto] p-5 md:p-7">
            {canSkip && (
              <button
                type="button"
                onClick={() => {
                  completedRef.current = true;
                  stopAudio();
                  onSkip?.();
                }}
                className="absolute right-5 top-5 z-20 rounded-md border border-white/15 bg-white/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-trauma/50 hover:bg-trauma/15 hover:text-trauma md:right-7 md:top-7"
              >
                Skip assignment
              </button>
            )}
            <header className="text-center">
              <div className="font-display text-xs font-bold uppercase tracking-[0.32em] text-trauma">Shape assignment</div>
              <h2 className="mt-2 font-display text-5xl font-black uppercase leading-none md:text-7xl">Choose Your Shape</h2>
            </header>

            <main className="grid min-h-0 place-items-center py-6">
              <AnimatePresence mode="wait">
                {showSummary ? (
                  <AssignmentSummary players={players} />
                ) : !activePlayer ? (
                  <motion.div
                    key="opening"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    className="grid justify-items-center text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                      className="grid h-72 w-72 place-items-center rounded-full border border-trauma/55 bg-trauma/10 shadow-[0_0_64px_rgba(255,48,77,0.24)]"
                    >
                      <ShapeIcon shape={openingShape} className={`h-44 w-44 ${shapeColor(openingShape)}`} />
                    </motion.div>
                    <div className="mt-8 font-display text-xs font-bold uppercase tracking-[0.42em] text-monitor">Next phase</div>
                    <div className="mt-3 font-display text-6xl font-black uppercase md:text-8xl">Shape Selection</div>
                    <p className="mt-4 max-w-3xl text-2xl font-semibold leading-9 text-white/68">
                      Each participant receives a shape. That shape will be used for random question selection during stations.
                    </p>
                  </motion.div>
                ) : (
                  <FeaturedReveal player={activePlayer} index={activeIndex} elapsed={elapsed} playerCount={players.length} />
                )}
              </AnimatePresence>
            </main>

            <footer className="grid gap-4">
              <MiniRoster players={players} activeIndex={activeIndex} elapsed={elapsed} />
              <div className="grid gap-3 border-t border-white/10 pt-4">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-trauma via-amber to-scrub" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                  <span>{assignedCount}/{players.length} assigned</span>
                  <span>{Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000))}s</span>
                </div>
              </div>
            </footer>
          </div>

          <audio ref={audioRef} src={introAudioSrc} preload="auto" />
          <PhaseBrief
            visible={elapsed < 2400}
            label="Next phase"
            title="Shape Selection"
            subtitle="Each participant receives a game shape before the first station begins."
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
