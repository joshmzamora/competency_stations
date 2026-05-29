import { AnimatePresence, motion } from "framer-motion";
import { Circle, ShieldCheck, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerShape, PlayerState } from "../types";

const ALL_SHAPES: PlayerShape[] = ["triangle", "star", "umbrella", "circle", "square"];
const totalDurationMs = 8200;
const introAudioSrc = "/audio/squid_game_choosing_shapes.mp3";
const maxVolume = 0.46;
const fadeOutMs = 1400;

type PhaseName = "shuffle" | "reveal";

function phaseForElapsed(elapsed: number): PhaseName {
  return elapsed < 2400 ? "shuffle" : "reveal";
}

function revealAt(index: number) {
  return 2850 + index * 620;
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
  if (shape === "triangle") return "border-trauma/70 shadow-[0_0_42px_rgba(255,48,77,0.28)]";
  if (shape === "star") return "border-amber/70 shadow-[0_0_42px_rgba(255,176,32,0.24)]";
  if (shape === "umbrella") return "border-white/40 shadow-[0_0_42px_rgba(255,255,255,0.14)]";
  if (shape === "circle") return "border-scrub/65 shadow-[0_0_42px_rgba(36,245,199,0.22)]";
  if (shape === "square") return "border-monitor/65 shadow-[0_0_42px_rgba(110,247,255,0.2)]";
  return "border-white/10";
}

function publicName(name: string) {
  const match = name.match(/\((.*)\)/);
  return match?.[1] || name;
}

function IdentityCard({ player, index, elapsed }: { player: PlayerState; index: number; elapsed: number }) {
  const isRevealed = elapsed >= revealAt(index);
  const placeholderShape = ALL_SHAPES[Math.floor((elapsed / 120 + index) % ALL_SHAPES.length)];
  const shape = player.shape ?? placeholderShape;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: isRevealed ? 1 : 0.96 }}
      transition={{ delay: index * 0.05, duration: 0.32, ease: "easeOut" }}
      className={`relative min-h-[188px] overflow-hidden rounded-md border bg-[#07090d] p-4 text-center ${isRevealed ? shapeRing(player.shape) : "border-white/10"}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-trauma/70 to-transparent" />
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-white/32">Participant {index + 1}</div>
      <div className="mt-2 truncate font-display text-2xl font-black uppercase text-white">{publicName(player.name)}</div>

      <motion.div
        key={`${player.id}-${isRevealed ? player.shape : placeholderShape}`}
        initial={{ scale: 0.65, rotate: -10, opacity: 0 }}
        animate={{ scale: isRevealed ? 1 : 0.86, rotate: 0, opacity: isRevealed ? 1 : 0.28 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className={`mx-auto mt-6 flex justify-center ${isRevealed && player.shape ? shapeColor(player.shape) : "text-white/22"}`}
      >
        <ShapeIcon shape={shape} className="h-20 w-20" />
      </motion.div>

      <div className={`mt-4 font-display text-base font-black uppercase tracking-[0.22em] ${isRevealed && player.shape ? shapeColor(player.shape) : "text-white/20"}`}>
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
  const [audioBlocked, setAudioBlocked] = useState(false);
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
    if (playPromise) playPromise.then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    const volumeId = window.setInterval(syncAudio, 80);

    return () => {
      window.clearInterval(volumeId);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [open, startedAt]);

  const phase = phaseForElapsed(elapsed);
  const progress = Math.min(100, (elapsed / totalDurationMs) * 100);
  const cyclingShape = ALL_SHAPES[Math.floor(elapsed / 105) % ALL_SHAPES.length];
  const revealedCount = useMemo(() => players.filter((_, index) => elapsed >= revealAt(index)).length, [elapsed, players]);

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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,48,77,0.18),transparent_34%),radial-gradient(circle_at_50%_75%,rgba(36,245,199,0.08),transparent_40%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-trauma/14 to-transparent" />

          <div className="relative grid h-screen grid-rows-[auto_1fr_auto] p-5 md:p-7">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="font-display text-xs font-bold uppercase tracking-[0.24em] text-trauma">Shape assignment</div>
                <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none md:text-6xl">Choose Your Shape</h2>
              </div>
              <div className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.045] px-4 py-3">
                <ShieldCheck className="h-6 w-6 text-scrub" />
                <div>
                  <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">Participants</div>
                  <div className="font-display text-2xl font-black text-white">{players.length}</div>
                </div>
              </div>
            </header>

            <main className="grid min-h-0 place-items-center py-5">
              <AnimatePresence mode="wait">
                {phase === "shuffle" && (
                  <motion.div
                    key="shuffle"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="grid w-full max-w-5xl gap-8 text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
                      className="mx-auto grid h-36 w-36 place-items-center rounded-full border border-trauma/55 bg-trauma/10 shadow-[0_0_54px_rgba(255,48,77,0.2)]"
                    >
                      <ShapeIcon shape={cyclingShape} className={`h-20 w-20 ${shapeColor(cyclingShape)}`} />
                    </motion.div>
                    <div>
                      <div className="font-display text-xs font-bold uppercase tracking-[0.34em] text-monitor">Randomizing identifiers</div>
                      <h3 className="mt-3 font-display text-5xl font-black uppercase md:text-7xl">Stand By</h3>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      {ALL_SHAPES.map((shape, index) => (
                        <motion.div
                          key={shape}
                          animate={{ y: [0, -14, 0], opacity: [0.42, 1, 0.42] }}
                          transition={{ duration: 0.78, repeat: Infinity, delay: index * 0.08 }}
                          className="grid h-16 w-16 place-items-center rounded-md border border-white/10 bg-white/[0.045]"
                        >
                          <ShapeIcon shape={shape} className={`h-9 w-9 ${shapeColor(shape)}`} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {phase === "reveal" && (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid w-full max-w-6xl gap-5"
                  >
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <div className="font-display text-xs font-bold uppercase tracking-[0.24em] text-trauma">Reveal sequence</div>
                        <h3 className="mt-2 font-display text-4xl font-black uppercase md:text-6xl">
                          {revealedCount}/{players.length} Assigned
                        </h3>
                      </div>
                      <div className="rounded-md border border-white/10 bg-white/[0.045] px-4 py-3 text-right">
                        <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">Priority pool</div>
                        <div className="text-sm text-white/72">Triangle, star, umbrella, circle. Square only appears for a fifth participant.</div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      {players.map((player, index) => (
                        <IdentityCard key={player.id} player={player} index={index} elapsed={elapsed} />
                      ))}
                    </div>
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

          {audioBlocked && (
            <button
              type="button"
              onClick={() => audioRef.current?.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true))}
              className="absolute bottom-8 right-8 z-10 rounded-md border border-white/15 bg-white/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white"
            >
              Enable audio
            </button>
          )}
          <audio ref={audioRef} src={introAudioSrc} preload="auto" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
