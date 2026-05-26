import { Check, Copy, Minus, Play, Plus, Power, Radio, Timer, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { JeopardyTile } from "../components/JeopardyTile";
import { Modal } from "../components/Modal";
import { QuestionCard } from "../components/QuestionCard";
import { ScoreBadge } from "../components/ScoreBadge";
import { getBoardQuestions } from "../data/questions";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { Question } from "../types";

export function HostPage() {
  const { status, room, error, send, clearError } = useRoomSocket();
  const [selected, setSelected] = useState<Question | null>(null);
  const board = useMemo(() => getBoardQuestions(), []);
  const selectedQuestion = room?.selectedQuestion ?? selected;

  function selectQuestion(question: Question) {
    setSelected(question);
    send({ type: "select-question", question });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-monitor">Host command</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Run the station board</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ScoreBadge score={room?.score ?? 0} />
          <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="font-display text-[10px] uppercase tracking-[0.18em] text-white/45">Socket</div>
            <div className="font-display text-xl font-bold uppercase text-scrub">{status}</div>
          </div>
        </div>
      </div>

      {!room ? (
        <div className="grid gap-4 rounded-md border border-white/10 bg-black/35 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-white">Create a room code</h2>
            <p className="mt-2 max-w-2xl text-white/60">
              Keep this screen on the host computer. Players join from another browser using the host computer local IP address.
            </p>
          </div>
          <AnimatedButton onClick={() => send({ type: "create-room" })} disabled={status !== "open"}>
            <Radio className="h-4 w-4" />
            Create room
          </AnimatedButton>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-md border border-white/10 bg-black/35 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-xs uppercase tracking-[0.2em] text-white/45">Room code</div>
                <div className="font-display text-5xl font-black text-scrub">{room.code}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatedButton variant="ghost" onClick={() => navigator.clipboard.writeText(room.code)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </AnimatedButton>
                <AnimatedButton variant="secondary" onClick={() => send({ type: "start-session" })}>
                  <Play className="h-4 w-4" />
                  Start
                </AnimatedButton>
                <AnimatedButton variant="danger" onClick={() => send({ type: "end-game" })}>
                  <Power className="h-4 w-4" />
                  End
                </AnimatedButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {board.map((column) => (
                <div key={column.category} className="grid gap-2">
                  <div className="grid min-h-20 place-items-center rounded-md border border-trauma/30 bg-trauma/10 p-2 text-center font-display text-xs font-bold uppercase leading-tight tracking-[0.1em] text-white">
                    {column.category}
                  </div>
                  {column.questions.map((question) => (
                    <JeopardyTile
                      key={question.id}
                      question={question}
                      used={room.usedQuestionIds.includes(question.id)}
                      onSelect={selectQuestion}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-4">
            <QuestionCard question={selectedQuestion} revealed={room.revealed} />
            <CountdownTimer endsAt={room.timerEndsAt} />
            <div className="grid grid-cols-2 gap-2">
              <AnimatedButton variant="secondary" onClick={() => send({ type: "start-timer", seconds: 30 })}>
                <Timer className="h-4 w-4" />
                30 sec
              </AnimatedButton>
              <AnimatedButton variant="ghost" onClick={() => send({ type: "reveal-answer" })}>
                Reveal
              </AnimatedButton>
              <AnimatedButton variant="secondary" onClick={() => send({ type: "mark-answer", correct: true })} disabled={!selectedQuestion}>
                <Check className="h-4 w-4" />
                Correct
              </AnimatedButton>
              <AnimatedButton variant="danger" onClick={() => send({ type: "mark-answer", correct: false })} disabled={!selectedQuestion}>
                <X className="h-4 w-4" />
                Incorrect
              </AnimatedButton>
              <AnimatedButton variant="ghost" onClick={() => send({ type: "adjust-score", delta: 50 })}>
                <Plus className="h-4 w-4" />
                +50
              </AnimatedButton>
              <AnimatedButton variant="ghost" onClick={() => send({ type: "adjust-score", delta: -50 })}>
                <Minus className="h-4 w-4" />
                -50
              </AnimatedButton>
            </div>
            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Live answer</div>
              <p className="mt-3 min-h-16 text-white/75">{room.liveAnswer?.answer || "Waiting for player response."}</p>
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
        </div>
      )}

      <Modal open={Boolean(error)} title="Connection alert" onClose={clearError}>
        <p className="text-white/75">{error}</p>
      </Modal>
    </section>
  );
}
