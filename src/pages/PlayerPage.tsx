import { Circle as CircleIcon, Minus, Plus, Radio, Send, ShieldAlert, Square as SquareIcon, Star, Triangle, Umbrella } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { EvaluationEffect } from "../components/EvaluationEffect";
import { Modal } from "../components/Modal";
import { PromptCard } from "../components/PromptCard";
import { ScenarioIntro } from "../components/ScenarioIntro";
import { useAppChrome } from "../context/ChromeContext";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { PlayerShape, PlayerStation } from "../types";

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

function shapeColor(shape: PlayerShape) {
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
  }
}

export function PlayerPage() {
  const { status, room, error, send, clearError } = useRoomSocket();
  const { setNavHidden } = useAppChrome();
  const [code, setCode] = useState("");
  const [names, setNames] = useState<string[]>(["Player 1", "Player 2"]);
  const [answer, setAnswer] = useState("");
  const [promptStartedAt, setPromptStartedAt] = useState(Date.now());
  const [effectVisible, setEffectVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [assignmentVisible, setAssignmentVisible] = useState(false);
  const [introKeySeen, setIntroKeySeen] = useState("");
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
    if (introVisible && !room?.introStartedAt && room?.status === "in-progress") {
      setAssignmentVisible(true);
    }
    setIntroVisible(false);
  }, [room?.introStartedAt, introVisible, room?.status]);

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
      setNames([...names, `Player ${names.length + 1}`]);
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
            <div className="font-display text-[10px] uppercase tracking-[0.18em] text-white/45">Room</div>
            <div className="font-display text-3xl font-black text-scrub">{room.code}</div>
          </div>
        )}
      </div>

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
              <div className="font-display text-3xl font-black uppercase text-white">Stand by</div>
              <p className="mt-3 text-white/70">
                {station ? "The host has loaded the station and will start once the learner screen is connected." : "The host will select a competency station and advance prompts from the control room."}
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

      <Modal open={assignmentVisible} title="Shape Assignment" onClose={() => setAssignmentVisible(false)}>
        <div className="grid gap-6 py-4">
          <div className="text-center">
            <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber">Squid Game Protocol</div>
            <h3 className="mt-1 font-display text-2xl font-black uppercase text-white">Your assigned identities</h3>
            <p className="mt-2 text-sm text-white/60">Memorize your shape. The host will call upon you during the simulation.</p>
          </div>
          <div className="grid gap-3">
            {room?.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="font-display text-xl font-bold text-white">{player.name}</div>
                {player.shape && (
                  <div className={`flex items-center gap-3 font-display text-lg font-black uppercase tracking-widest ${shapeColor(player.shape)}`}>
                    <ShapeIcon shape={player.shape} className="h-6 w-6" />
                    {player.shape}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <AnimatedButton onClick={() => setAssignmentVisible(false)}>
              Understand
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </section>
  );
}
