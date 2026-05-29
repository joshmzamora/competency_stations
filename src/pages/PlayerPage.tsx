import { Circle as CircleIcon, Hexagon, Minus, Pentagon, Plus, Radio, ShieldAlert, Square as SquareIcon, Triangle } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { EvaluationEffect } from "../components/EvaluationEffect";
import { Modal } from "../components/Modal";
import { ProtocolIntro } from "../components/ProtocolIntro";
import { ScenarioIntro } from "../components/ScenarioIntro";
import { SelectionRoulette } from "../components/SelectionRoulette";
import { useAppChrome } from "../context/ChromeContext";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { PlayerPrompt, PlayerShape, PlayerState, PlayerStation } from "../types";

function ShapeIcon({ shape, className }: { shape: PlayerShape; className?: string }) {
  switch (shape) {
    case "circle": return <CircleIcon className={className} />;
    case "triangle": return <Triangle className={className} />;
    case "square": return <SquareIcon className={className} />;
    case "pentagon": return <Pentagon className={className} />;
    case "hexagon": return <Hexagon className={className} />;
  }
}

function publicName(name?: string) {
  if (!name) return "Participant";
  const match = name.match(/\((.*)\)/);
  return match?.[1] || name;
}

function shapeTone(shape?: PlayerShape) {
  switch (shape) {
    case "circle": return { text: "text-scrub", border: "border-scrub/45", bg: "bg-scrub/10", shadow: "shadow-[0_0_44px_rgba(34,245,199,0.2)]" };
    case "triangle": return { text: "text-trauma", border: "border-trauma/45", bg: "bg-trauma/10", shadow: "shadow-[0_0_44px_rgba(255,48,77,0.22)]" };
    case "square": return { text: "text-monitor", border: "border-monitor/45", bg: "bg-monitor/10", shadow: "shadow-[0_0_44px_rgba(110,247,255,0.18)]" };
    case "pentagon": return { text: "text-amber", border: "border-amber/45", bg: "bg-amber/10", shadow: "shadow-[0_0_44px_rgba(255,176,32,0.18)]" };
    case "hexagon": return { text: "text-white", border: "border-white/35", bg: "bg-white/10", shadow: "shadow-[0_0_38px_rgba(255,255,255,0.12)]" };
    default: return { text: "text-white/40", border: "border-white/10", bg: "bg-white/[0.04]", shadow: "" };
  }
}

function ParticipantStrip({ players, activeId }: { players: PlayerState[]; activeId?: string | null }) {
  if (players.length === 0) return null;
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
      {players.map((player) => {
        const active = player.id === activeId;
        const tone = shapeTone(player.shape);
        return (
          <div
            key={player.id}
            className={`rounded-md border p-3 transition ${
              active ? `${tone.border} ${tone.bg} ${tone.shadow}` : "border-white/10 bg-black/30 opacity-60"
            }`}
          >
            <div className="flex items-center gap-2">
              {player.shape && <ShapeIcon shape={player.shape} className={`h-6 w-6 ${tone.text}`} />}
              <div className="min-w-0">
                <div className="truncate font-display text-xs font-black uppercase text-white">{publicName(player.name)}</div>
                <div className={`font-display text-[9px] font-bold uppercase tracking-[0.14em] ${active ? tone.text : "text-white/35"}`}>
                  {active ? "Active" : "Standby"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivePromptView({
  prompt,
  station,
  activeParticipant,
  promptNumber,
  totalPrompts
}: {
  prompt: PlayerPrompt;
  station: PlayerStation;
  activeParticipant?: PlayerState;
  promptNumber: number;
  totalPrompts: number;
}) {
  const tone = shapeTone(activeParticipant?.shape);

  return (
    <motion.div
      key={`${prompt.id}-${activeParticipant?.id ?? "none"}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid min-h-[70vh] gap-5 rounded-md border border-white/10 bg-black/45 p-5 md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-monitor">{station.title}</div>
          <div className="mt-1 text-sm text-white/45">Prompt {promptNumber} of {totalPrompts}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 font-display text-xs font-black uppercase tracking-[0.16em] text-white/65">
          {prompt.type.replace(/-/g, " ")}
        </div>
      </div>

      <div className={`grid gap-5 rounded-md border p-5 md:grid-cols-[180px_1fr] md:items-center ${tone.border} ${tone.bg}`}>
        <motion.div
          initial={{ scale: 0.75, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 230, damping: 18 }}
          className={`grid aspect-square place-items-center rounded-md border ${tone.border} bg-black/30 ${tone.shadow}`}
        >
          {activeParticipant?.shape && <ShapeIcon shape={activeParticipant.shape} className={`h-28 w-28 ${tone.text}`} />}
        </motion.div>
        <div>
          <div className={`font-display text-xs font-black uppercase tracking-[0.28em] ${tone.text}`}>You have been selected</div>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">{publicName(activeParticipant?.name)}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-white/68">
            Answer verbally or perform the requested skill. The evaluator will mark the response from the host screen.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-monitor/25 bg-monitor/10 p-5">
        <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-monitor">Scenario prompt</div>
        <h3 className="mt-3 font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">{prompt.title}</h3>
        <p className="mt-5 text-2xl leading-10 text-white/82">{prompt.scenario}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {prompt.instructions.map((item, index) => (
          <div key={item} className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4">
            <div className="font-display text-xl font-black text-scrub">{String(index + 1).padStart(2, "0")}</div>
            <div className="text-lg leading-7 text-white/74">{item}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function PlayerPage() {
  const { status, room, error, clientId, send, clearError } = useRoomSocket();
  const { setNavHidden } = useAppChrome();
  const [code, setCode] = useState("");
  const [names, setNames] = useState<string[]>(["", ""]);
  const [effectVisible, setEffectVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [introKeySeen, setIntroKeySeen] = useState("");
  const [protocolIntroSeenAt, setProtocolIntroSeenAt] = useState<number | null>(null);

  const station = room?.selectedStation as PlayerStation | null | undefined;
  const prompt = station?.prompts[room?.activePromptIndex ?? 0];
  const isLive = room?.status === "in-progress";
  const activePrompt = isLive ? prompt : undefined;
  const activeParticipant = useMemo(() => room?.players.find((player) => player.id === room.currentParticipantId), [room?.currentParticipantId, room?.players]);
  const currentEvaluation = activePrompt ? room?.evaluations?.[activePrompt.id] : undefined;
  const introKey = room?.introStartedAt && station ? `${room.code}-${room.introStartedAt}` : "";
  const validNames = names.map((name) => name.trim()).filter(Boolean);

  useEffect(() => {
    if (!currentEvaluation?.evaluatedAt) return;
    setEffectVisible(true);
    const timeout = window.setTimeout(() => setEffectVisible(false), 1700);
    return () => window.clearTimeout(timeout);
  }, [currentEvaluation?.evaluatedAt]);

  useEffect(() => {
    if (!introKey || introKeySeen === introKey) return;
    setIntroVisible(true);
  }, [introKey, introKeySeen]);

  useEffect(() => {
    setNavHidden(Boolean(room));
    return () => setNavHidden(false);
  }, [room, setNavHidden]);

  useEffect(() => {
    if (room?.introStartedAt) return;
    setIntroVisible(false);
  }, [room?.introStartedAt]);

  const protocolIntroVisible = Boolean(
    room?.protocolIntroStartedAt &&
    room.protocolIntroStartedAt !== protocolIntroSeenAt &&
    !introVisible &&
    !room.introStartedAt
  );

  const closeIntro = useCallback(() => {
    setIntroKeySeen(introKey);
    setIntroVisible(false);
  }, [introKey]);

  function updateName(index: number, value: string) {
    const next = [...names];
    next[index] = value;
    setNames(next);
  }

  function addPlayer() {
    if (names.length < 5) setNames([...names, ""]);
  }

  function removePlayer(index: number) {
    if (names.length > 2) setNames(names.filter((_, i) => i !== index));
  }

  function join(event: FormEvent) {
    event.preventDefault();
    if (validNames.length < 2 || validNames.length > 5) return;
    send({ type: "join-room", code, names });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {!room ? (
        <>
          <div className="mb-6">
            <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-scrub">Learner monitor</div>
            <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Join Simulation</h1>
            <p className="mt-3 max-w-2xl text-white/62">Use one learner computer for the room. Add the names of the 2-5 participants who will take turns answering verbally.</p>
          </div>
          <form onSubmit={join} className="grid gap-6 rounded-md border border-white/10 bg-black/35 p-6">
            <label className="grid gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/55">Room code</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                className="rounded-md border border-scrub/30 bg-panel px-4 py-3 font-display text-3xl font-bold uppercase text-white outline-none focus:border-scrub"
                placeholder="ABCD"
                maxLength={6}
              />
            </label>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/55">Participants (2-5)</span>
                <button
                  type="button"
                  onClick={addPlayer}
                  disabled={names.length >= 5}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3">
                {names.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={name}
                      onChange={(event) => updateName(index, event.target.value)}
                      className="flex-1 rounded-md border border-white/10 bg-panel px-4 py-3 text-white outline-none focus:border-scrub"
                      placeholder={`Participant ${index + 1} name`}
                    />
                    {names.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(index)}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-trauma/30 bg-trauma/10 text-trauma"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {validNames.length < 2 && <p className="text-sm text-amber">Enter at least 2 participant names before joining.</p>}
            <AnimatedButton disabled={status !== "open" || code.trim().length < 4 || validNames.length < 2 || validNames.length > 5}>
              <Radio className="h-4 w-4" />
              Join simulation
            </AnimatedButton>
          </form>
        </>
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 p-4">
            <div>
              <div className="font-display text-xs uppercase tracking-[0.18em] text-white/45">Active station</div>
              <div className="font-display text-3xl font-black uppercase text-white">{station?.title ?? "Waiting for station"}</div>
              {station && !isLive && <p className="mt-1 text-sm text-amber">Station loaded. Waiting for the host to start.</p>}
            </div>
            <div className="rounded-md border border-scrub/35 bg-scrub/10 px-4 py-3 text-right">
              <div className="font-display text-[10px] uppercase tracking-[0.18em] text-white/45">Room</div>
              <div className="font-display text-3xl font-black text-scrub">{room.code}</div>
            </div>
          </div>

          <ParticipantStrip players={room.players} activeId={room.currentParticipantId} />
          <CountdownTimer endsAt={room.timerEndsAt} />

          {activePrompt && station && activeParticipant ? (
            <ActivePromptView
              prompt={activePrompt}
              station={station}
              activeParticipant={activeParticipant}
              promptNumber={(room.activePromptIndex ?? 0) + 1}
              totalPrompts={station.prompts.length}
            />
          ) : (
            <div className="rounded-md border border-amber/25 bg-amber/10 p-8 text-amber">
              <ShieldAlert className="mb-3 h-8 w-8" />
              <div className="font-display text-3xl font-black uppercase text-white">Stand By</div>
              <p className="mt-3 text-white/70">
                {station
                  ? "The host will run the selection animation before the next prompt appears."
                  : "The host will select a competency station and start the session."}
              </p>
            </div>
          )}
        </div>
      )}

      <Modal open={Boolean(error)} title="Connection alert" onClose={clearError}>
        <p className="text-white/75">{error}</p>
      </Modal>
      <EvaluationEffect status={currentEvaluation?.status} visible={effectVisible} />
      <ScenarioIntro open={introVisible} role="player" startedAt={room?.introStartedAt} serverTime={room?.serverTime} onClose={closeIntro} />
      <ProtocolIntro
        open={protocolIntroVisible}
        startedAt={room?.protocolIntroStartedAt ?? null}
        players={room?.players ?? []}
        onComplete={() => setProtocolIntroSeenAt(room?.protocolIntroStartedAt ?? null)}
      />
      <SelectionRoulette selection={room?.selection ?? null} players={room?.players ?? []} clientId={clientId} />
    </section>
  );
}
