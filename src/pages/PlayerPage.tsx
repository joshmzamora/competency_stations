import { Circle as CircleIcon, Minus, Plus, Radio, Send, ShieldAlert, Square as SquareIcon, Star, Triangle, Umbrella } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { EvaluationEffect } from "../components/EvaluationEffect";
import { Modal } from "../components/Modal";
import { PromptCard } from "../components/PromptCard";
import { ProtocolIntro } from "../components/ProtocolIntro";
import { ScenarioIntro } from "../components/ScenarioIntro";
import { SelectionRoulette } from "../components/SelectionRoulette";
import { useAppChrome } from "../context/ChromeContext";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { PlayerShape, PlayerState, PlayerStation } from "../types";

function shapeColor(shape: PlayerShape) {
  switch (shape) {
    case "circle": return "text-scrub";
    case "triangle": return "text-trauma";
    case "square": return "text-monitor";
    case "star": return "text-amber";
    case "umbrella": return "text-white";
  }
}

function ShapeIcon({ shape, className }: { shape: PlayerShape; className?: string }) {
  switch (shape) {
    case "circle":
      return <CircleIcon className={className} />;
    case "triangle":
      return <Triangle className={className} />;
    case "square":
      return <SquareIcon className={className} />;
    case "star":
      return <Star className={className} />;
    case "umbrella":
      return <Umbrella className={className} />;
  }
}

function AssignedPlayerRow({ name, shape }: { name: string; shape: PlayerShape }) {
  const [displayShape, setDisplayShape] = useState<PlayerShape>("circle");
  const [isRevealed, setIsRevealed] = useState(false);
  const shapes: PlayerShape[] = ["circle", "triangle", "square", "star", "umbrella"];

  useEffect(() => {
    let count = 0;
    const max = 15 + Math.floor(Math.random() * 10);
    const interval = window.setInterval(() => {
      setDisplayShape(shapes[Math.floor(Math.random() * shapes.length)]);
      count++;
      if (count >= max) {
        window.clearInterval(interval);
        setDisplayShape(shape);
        setIsRevealed(true);
      }
    }, 100);
    return () => window.clearInterval(interval);
  }, [shape]);

  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] p-4">
      <div className="font-display text-xl font-bold text-white">{name}</div>
      <div className={`flex items-center gap-3 font-display text-lg font-black uppercase tracking-widest transition-all duration-500 ${isRevealed ? shapeColor(shape) : "text-white/20"} ${isRevealed ? "scale-110" : "scale-100"}`}>
        <ShapeIcon shape={displayShape} className="h-6 w-6" />
        {isRevealed ? shape : "???"}
      </div>
    </div>
  );
}

function ParticipantRoster({ players }: { players: PlayerState[] }) {
  if (players.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3 rounded-md border border-white/10 bg-black/40 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-1">
        <div className="h-2 w-2 rounded-full bg-monitor animate-pulse" />
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Participants</span>
      </div>
      {players.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-md border border-white/5 bg-white/5 px-3 py-2 transition-all hover:bg-white/10">
          <div className="flex items-center gap-2">
             {p.shape && <ShapeIcon shape={p.shape as PlayerShape} className={`h-4 w-4 ${shapeColor(p.shape as PlayerShape)}`} />}
             <span className="font-display text-xs font-bold uppercase tracking-widest text-white/90">{p.name}</span>
          </div>
          <div className={`h-2 w-2 rounded-full ${p.connected ? "bg-scrub shadow-[0_0_10px_rgba(34,245,199,0.8)]" : "bg-white/10"}`} />
        </div>
      ))}
    </div>
  );
}

export function PlayerPage() {
  const { status, room, error, clientId, send, clearError } = useRoomSocket();
  const { setNavHidden } = useAppChrome();
  const [code, setCode] = useState("");
  const [names, setNames] = useState<string[]>(["", ""]);
  const [answer, setAnswer] = useState("");
  const [promptStartedAt, setPromptStartedAt] = useState(Date.now());
  const [effectVisible, setEffectVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [introKeySeen, setIntroKeySeen] = useState("");
  // Track which protocolIntroStartedAt timestamp we have already shown
  const [protocolIntroSeenAt, setProtocolIntroSeenAt] = useState<number | null>(null);
  const station = room?.selectedStation as PlayerStation | null | undefined;
  const prompt = station?.prompts[room?.activePromptIndex ?? 0];
  const isLive = room?.status === "in-progress";
  const activePrompt = isLive ? prompt : undefined;
  const currentEvaluation = activePrompt ? room?.evaluations?.[activePrompt.id] : undefined;
  const introKey = room?.introStartedAt && station ? `${room.code}-${room.introStartedAt}` : "";

  useEffect(() => {
    if (activePrompt?.id) {
      setAnswer("");
      setPromptStartedAt(Date.now());
    }
  }, [activePrompt?.id]);

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

  // Show protocol intro whenever a new startedAt arrives that we haven't seen yet
  const protocolIntroVisible = Boolean(
    room?.protocolIntroStartedAt &&
    room.protocolIntroStartedAt !== protocolIntroSeenAt
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
    if (names.length < 5) {
      setNames([...names, ""]);
    }
  }

  function removePlayer(index: number) {
    if (names.length > 2) {
      setNames(names.filter((_, i) => i !== index));
    }
  }

  function join(event: FormEvent) {
    event.preventDefault();
    send({ type: "join-room", code, names });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send({ type: "submit-answer", answer, responseTimeMs: Date.now() - promptStartedAt });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-scrub">Learner monitor</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Simulation prompt screen</h1>
        </div>
        {room && (
          <div className="rounded-md border border-scrub/35 bg-scrub/10 px-4 py-3">
            <div className="font-display text-[10px] uppercase tracking-[0.18em] text-white/45">Room code</div>
            <div className="font-display text-3xl font-black text-scrub">{room.code}</div>
          </div>
        )}
      </div>

      {room && (
        <div className="mb-8">
          <ParticipantRoster players={room.players} />
        </div>
      )}

      {!room ? (
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
              <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/55">Simulation players (2-5)</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addPlayer}
                  disabled={names.length >= 5}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {names.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={name}
                    onChange={(event) => updateName(index, event.target.value)}
                    className="flex-1 rounded-md border border-white/10 bg-panel px-4 py-3 text-white outline-none focus:border-scrub"
                    placeholder={`Player ${index + 1} name`}
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
          <AnimatedButton disabled={status !== "open"}>
            <Radio className="h-4 w-4" />
            Join simulation
          </AnimatedButton>
        </form>
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 p-4">
            <div>
              <div className="font-display text-xs uppercase tracking-[0.18em] text-white/45">Active station</div>
              <div className="font-display text-3xl font-black uppercase text-white">{station?.title ?? "Waiting for station"}</div>
              {station && !isLive && <p className="mt-1 text-sm text-amber">Station loaded. Waiting for host to start.</p>}
            </div>
            <div className="rounded-md border border-scrub/25 bg-scrub/10 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-scrub">
              Connected
            </div>
          </div>

          <CountdownTimer endsAt={room.timerEndsAt} />

          {activePrompt ? (
            <>
              <PromptCard prompt={activePrompt} playerMode />
              <form onSubmit={submit} className="rounded-md border border-white/10 bg-black/35 p-4">
                <label className="grid gap-2">
                  <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-monitor">Optional learner note</span>
                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    className="min-h-24 rounded-md border border-white/10 bg-panel px-4 py-3 text-white outline-none focus:border-scrub"
                    placeholder="Most responses are verbal or performed in person. Type a note only if the host asks."
                  />
                </label>
                <div className="mt-3 flex justify-end">
                  <AnimatedButton variant="ghost" disabled={!answer.trim()}>
                    <Send className="h-4 w-4" />
                    Send note
                  </AnimatedButton>
                </div>
              </form>
            </>
          ) : (
            <div className="rounded-md border border-amber/25 bg-amber/10 p-8 text-amber">
              <ShieldAlert className="mb-3 h-8 w-8" />
              <div className="font-display text-3xl font-black uppercase text-white">Trial Stand By</div>
              <p className="mt-3 text-white/70">
                {station ? "The trial environment is active. Awaiting participant selection." : "The host will select a competency station and initialize the trial protocol."}
              </p>
            </div>
          )}
        </div>
      )}

      <Modal open={Boolean(error)} title="Connection alert" onClose={clearError}>
        <p className="text-white/75">{error}</p>
      </Modal>
      <EvaluationEffect status={currentEvaluation?.status} visible={effectVisible} />
      <ScenarioIntro
        open={introVisible}
        role="player"
        startedAt={room?.introStartedAt}
        serverTime={room?.serverTime}
        onClose={closeIntro}
      />

      <ProtocolIntro
        open={protocolIntroVisible}
        startedAt={room?.protocolIntroStartedAt ?? null}
        players={room?.players ?? []}
        onComplete={() => setProtocolIntroSeenAt(room?.protocolIntroStartedAt ?? null)}
      />

      <SelectionRoulette
        selection={room?.selection ?? null}
        players={room?.players ?? []}
        clientId={clientId}
      />

    </section>
  );
}
