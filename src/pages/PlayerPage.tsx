import { CheckCircle2, Radio, Send, ShieldAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { Modal } from "../components/Modal";
import { QuestionCard } from "../components/QuestionCard";
import { ScoreBadge } from "../components/ScoreBadge";
import { useRoomSocket } from "../hooks/useRoomSocket";

export function PlayerPage() {
  const { status, room, error, send, clearError } = useRoomSocket();
  const [code, setCode] = useState("");
  const [name, setName] = useState("Player");
  const [answer, setAnswer] = useState("");
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());

  useEffect(() => {
    if (room?.selectedQuestion?.id) {
      setAnswer("");
      setQuestionStartedAt(Date.now());
    }
  }, [room?.selectedQuestion?.id]);

  function join(event: FormEvent) {
    event.preventDefault();
    send({ type: "join-room", code, name });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send({ type: "submit-answer", answer, responseTimeMs: Date.now() - questionStartedAt });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-scrub">Player terminal</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Join the challenge</h1>
        </div>
        <ScoreBadge score={room?.score ?? 0} label="Live score" />
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
            <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/55">Player name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-md border border-white/10 bg-panel px-4 py-3 text-white outline-none focus:border-scrub"
            />
          </label>
          <AnimatedButton disabled={status !== "open"}>
            <Radio className="h-4 w-4" />
            Join room
          </AnimatedButton>
        </form>
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 p-4">
            <div>
              <div className="font-display text-xs uppercase tracking-[0.18em] text-white/45">Connected to</div>
              <div className="font-display text-4xl font-black text-scrub">{room.code}</div>
            </div>
            <AnimatedButton variant="secondary" onClick={() => send({ type: "player-ready", ready: true })}>
              <CheckCircle2 className="h-4 w-4" />
              Ready
            </AnimatedButton>
          </div>

          <QuestionCard question={room.selectedQuestion} revealed={room.revealed} />
          <CountdownTimer endsAt={room.timerEndsAt} />

          {room.selectedQuestion ? (
            <form onSubmit={submit} className="rounded-md border border-white/10 bg-black/35 p-4">
              <label className="grid gap-2">
                <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-monitor">Your answer</span>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  className="min-h-28 rounded-md border border-white/10 bg-panel px-4 py-3 text-white outline-none focus:border-scrub"
                  placeholder="Type your response..."
                />
              </label>
              <div className="mt-3 flex justify-end">
                <AnimatedButton disabled={!answer.trim()}>
                  <Send className="h-4 w-4" />
                  Submit
                </AnimatedButton>
              </div>
            </form>
          ) : (
            <div className="rounded-md border border-amber/25 bg-amber/10 p-5 text-amber">
              <ShieldAlert className="mb-3 h-6 w-6" />
              Waiting for the host to select a station prompt.
            </div>
          )}

          {room.feedback && (
            <div className={`rounded-md border p-5 ${room.feedback.correct ? "border-scrub/35 bg-scrub/10" : "border-trauma/35 bg-trauma/10"}`}>
              <div className="font-display text-2xl font-bold uppercase text-white">{room.feedback.correct ? "Correct" : "Review needed"}</div>
              <p className="mt-2 text-white/75">{room.feedback.explanation}</p>
            </div>
          )}
        </div>
      )}

      <Modal open={Boolean(error)} title="Connection alert" onClose={clearError}>
        <p className="text-white/75">{error}</p>
      </Modal>
    </section>
  );
}
