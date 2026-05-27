import { Radio, Send, ShieldAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { EvaluationEffect } from "../components/EvaluationEffect";
import { Modal } from "../components/Modal";
import { PromptCard } from "../components/PromptCard";
import { ScenarioIntro } from "../components/ScenarioIntro";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { PlayerStation } from "../types";

export function PlayerPage() {
  const { status, room, error, send, clearError } = useRoomSocket();
  const [code, setCode] = useState("");
  const [name, setName] = useState("Learner");
  const [answer, setAnswer] = useState("");
  const [promptStartedAt, setPromptStartedAt] = useState(Date.now());
  const [effectVisible, setEffectVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [introKeySeen, setIntroKeySeen] = useState("");
  const station = room?.selectedStation as PlayerStation | null | undefined;
  const prompt = station?.prompts[room?.activePromptIndex ?? 0];
  const isLive = room?.status === "in-progress";
  const activePrompt = isLive ? prompt : undefined;
  const currentEvaluation = activePrompt ? room?.evaluations?.[activePrompt.id] : undefined;
  const introKey = room?.status === "in-progress" && station ? `${room.code}-${room.createdAt}` : "";

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

  function join(event: FormEvent) {
    event.preventDefault();
    send({ type: "join-room", code, name });
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
        <form onSubmit={join} className="grid gap-4 rounded-md border border-white/10 bg-black/35 p-6">
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
          <label className="grid gap-2">
            <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/55">Learner name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-md border border-white/10 bg-panel px-4 py-3 text-white outline-none focus:border-scrub"
            />
          </label>
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
        onClose={() => {
          setIntroKeySeen(introKey);
          setIntroVisible(false);
        }}
      />
    </section>
  );
}
