import { Check, ChevronLeft, ChevronRight, Copy, Flag, Minus, PauseCircle, Play, Plus, Power, Radio, Timer, X } from "lucide-react";
import { useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { Modal } from "../components/Modal";
import { PromptCard } from "../components/PromptCard";
import { ScoreBadge } from "../components/ScoreBadge";
import { StationCard } from "../components/StationCard";
import { stations } from "../data/stations";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { CompetencyPrompt, CompetencyStation, EvaluationStatus } from "../types";

export function HostPage() {
  const { status, room, error, send, clearError } = useRoomSocket();
  const [note, setNote] = useState("");
  const [flagged, setFlagged] = useState(false);
  const station = room?.selectedStation as CompetencyStation | null | undefined;
  const prompt = station?.prompts[room?.activePromptIndex ?? 0] as CompetencyPrompt | undefined;
  const totalPrompts = station?.prompts.length ?? 0;
  const evaluations = room?.evaluations ?? {};
  const completed = Object.keys(evaluations).length;
  const progress = totalPrompts ? Math.round((completed / totalPrompts) * 100) : 0;

  function evaluate(statusValue: EvaluationStatus) {
    if (!prompt) return;
    send({ type: "evaluate-prompt", promptId: prompt.id, status: statusValue, note, flagged });
    setNote("");
    setFlagged(false);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-monitor">Host evaluator</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Competency control room</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ScoreBadge score={room?.score ?? 0} label="Competency score" />
          <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="font-display text-[10px] uppercase tracking-[0.18em] text-white/45">Socket</div>
            <div className="font-display text-xl font-bold uppercase text-scrub">{status}</div>
          </div>
        </div>
      </div>

      {!room ? (
        <div className="grid gap-4 rounded-md border border-white/10 bg-black/35 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-white">Create a local room</h2>
            <p className="mt-2 max-w-2xl text-white/60">
              Keep this screen on the host computer. The player computer connects to the local IP address and sees only learner-facing prompts.
            </p>
          </div>
          <AnimatedButton onClick={() => send({ type: "create-room" })} disabled={status !== "open"}>
            <Radio className="h-4 w-4" />
            Create room
          </AnimatedButton>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr_360px]">
          <aside className="grid content-start gap-4">
            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="font-display text-xs uppercase tracking-[0.2em] text-white/45">Room code</div>
              <div className="font-display text-5xl font-black text-scrub">{room.code}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <AnimatedButton variant="ghost" onClick={() => navigator.clipboard.writeText(room.code)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </AnimatedButton>
                <AnimatedButton variant="secondary" onClick={() => send({ type: "start-session" })}>
                  <Play className="h-4 w-4" />
                  Start
                </AnimatedButton>
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="mb-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Station navigation</div>
              <div className="grid gap-2">
                {stations.map((item) => {
                  const isActive = item.id === station?.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => send({ type: "open-station", station: item })}
                      className={`rounded-md border px-3 py-3 text-left transition ${
                        isActive ? "border-scrub/50 bg-scrub/10 text-scrub" : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25"
                      }`}
                    >
                      <div className="font-display text-sm font-bold uppercase tracking-[0.12em]">{item.shortTitle}</div>
                      <div className="mt-1 text-xs text-white/45">{item.prompts.length} prompts</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Players</div>
              <div className="mt-3 grid gap-2">
                {room.players.length === 0 && <p className="text-white/45">No players connected yet.</p>}
                {room.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2">
                    <span>{player.name}</span>
                    <span className={player.ready ? "text-scrub" : "text-white/40"}>{player.ready ? "Ready" : "Waiting"}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main>
            {!station ? (
              <div className="grid gap-4 md:grid-cols-2">
                {stations.map((item) => (
                  <StationCard key={item.id} station={item} onSelect={(nextStation) => send({ type: "open-station", station: nextStation })} />
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-display text-xs uppercase tracking-[0.18em] text-white/45">{station.competencyType}</div>
                      <h2 className="mt-1 font-display text-3xl font-black uppercase text-white">{station.title}</h2>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-black text-scrub">{progress}%</div>
                      <div className="text-xs text-white/45">
                        {completed}/{totalPrompts} evaluated
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-trauma via-monitor to-scrub" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <PromptCard prompt={prompt ?? null} showAnswer />

                <div className="flex flex-wrap justify-between gap-2">
                  <AnimatedButton variant="ghost" onClick={() => send({ type: "previous-prompt" })} disabled={(room.activePromptIndex ?? 0) <= 0}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </AnimatedButton>
                  <AnimatedButton variant="secondary" onClick={() => send({ type: "next-prompt" })} disabled={(room.activePromptIndex ?? 0) >= totalPrompts - 1}>
                    Next prompt
                    <ChevronRight className="h-4 w-4" />
                  </AnimatedButton>
                </div>
              </div>
            )}
          </main>

          <aside className="grid content-start gap-4">
            <CountdownTimer endsAt={room.timerEndsAt} />
            <div className="grid grid-cols-2 gap-2">
              <AnimatedButton variant="secondary" onClick={() => send({ type: "start-timer", seconds: prompt?.timerSeconds ?? 60 })} disabled={!prompt}>
                <Timer className="h-4 w-4" />
                Timer
              </AnimatedButton>
              <AnimatedButton variant="ghost" onClick={() => send({ type: "reset-timer" })}>
                <PauseCircle className="h-4 w-4" />
                Reset
              </AnimatedButton>
            </div>

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Rubric</div>
              {prompt ? (
                <ul className="mt-3 grid gap-2 text-sm text-white/72">
                  {prompt.evaluationCriteria.map((item) => (
                    <li key={item} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-white/45">Open a station to view evaluation criteria.</p>
              )}
            </div>

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Evaluation</div>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-3 min-h-24 w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-white outline-none focus:border-scrub"
                placeholder="Optional evaluator note..."
              />
              <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
                <input checked={flagged} onChange={(event) => setFlagged(event.target.checked)} type="checkbox" className="h-4 w-4 accent-red-500" />
                <Flag className="h-4 w-4 text-amber" />
                Flag for review
              </label>
              <div className="mt-3 grid gap-2">
                <AnimatedButton variant="secondary" onClick={() => evaluate("correct")} disabled={!prompt}>
                  <Check className="h-4 w-4" />
                  Correct
                </AnimatedButton>
                <AnimatedButton variant="ghost" onClick={() => evaluate("partial")} disabled={!prompt}>
                  Partial Credit
                </AnimatedButton>
                <AnimatedButton variant="danger" onClick={() => evaluate("incorrect")} disabled={!prompt}>
                  <X className="h-4 w-4" />
                  Incorrect
                </AnimatedButton>
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Live learner note</div>
              <p className="mt-3 min-h-16 text-white/75">{room.liveAnswer?.answer || "Verbal/in-person performance can be evaluated without player text."}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <AnimatedButton variant="ghost" onClick={() => send({ type: "adjust-score", delta: 25 })}>
                <Plus className="h-4 w-4" />
                25
              </AnimatedButton>
              <AnimatedButton variant="ghost" onClick={() => send({ type: "adjust-score", delta: -25 })}>
                <Minus className="h-4 w-4" />
                25
              </AnimatedButton>
              <AnimatedButton variant="danger" onClick={() => send({ type: "end-game" })}>
                <Power className="h-4 w-4" />
                End
              </AnimatedButton>
            </div>
          </aside>
        </div>
      )}

      <Modal open={Boolean(error)} title="Connection alert" onClose={clearError}>
        <p className="text-white/75">{error}</p>
      </Modal>
    </section>
  );
}
