import { RotateCcw, SkipForward } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { Flashcard } from "../components/Flashcard";
import { PromptCard } from "../components/PromptCard";
import { allPrompts, stations } from "../data/stations";
import type { CompetencyPrompt, EvaluationStatus } from "../types";
import { getStudyProgress, saveLocalResult, saveServerResult, saveStudyProgress } from "../utils/results";

type StudyMode = "flashcards" | "missed" | "drill";

export function StudyPage() {
  const [mode, setMode] = useState<StudyMode>("flashcards");
  const [stationId, setStationId] = useState<string>("all");
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(getStudyProgress);
  const [attempts, setAttempts] = useState<Array<{ prompt: CompetencyPrompt; status: EvaluationStatus }>>([]);

  const prompts = useMemo(
    () => allPrompts().filter((prompt) => stationId === "all" || prompt.stationId === stationId),
    [stationId]
  );
  const missedPrompts = useMemo(
    () => allPrompts().filter((prompt) => progress.missed.includes(prompt.id) || progress.review.includes(prompt.id)),
    [progress]
  );
  const deck = mode === "missed" ? missedPrompts : prompts;
  const prompt = deck[index % Math.max(1, deck.length)];

  function markCard(bucket: "gotIt" | "missed" | "review") {
    if (!prompt) return;
    const next = {
      gotIt: progress.gotIt.filter((id) => id !== prompt.id),
      missed: progress.missed.filter((id) => id !== prompt.id),
      review: progress.review.filter((id) => id !== prompt.id)
    };
    next[bucket].push(prompt.id);
    setProgress(next);
    saveStudyProgress(next);
    setIndex((value) => value + 1);
  }

  function drill(status: EvaluationStatus) {
    if (!prompt) return;
    setAttempts((value) => [...value, { prompt, status }]);
    markCard(status === "correct" ? "gotIt" : status === "partial" ? "review" : "missed");
  }

  function saveDrill() {
    const correct = attempts.filter((attempt) => attempt.status === "correct").length;
    const partial = attempts.filter((attempt) => attempt.status === "partial").length;
    const incorrect = attempts.filter((attempt) => attempt.status === "incorrect").length;
    const score = correct * 100 + partial * 50;
    const result = {
      id: crypto.randomUUID(),
      mode: "study" as const,
      createdAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      score,
      answered: attempts.length,
      correct,
      partial,
      incorrect,
      accuracy: attempts.length ? Math.round((score / (attempts.length * 100)) * 100) : 0,
      missedPromptIds: attempts.filter((attempt) => attempt.status !== "correct").map((attempt) => attempt.prompt.id),
      flaggedPromptIds: attempts.filter((attempt) => attempt.status === "partial").map((attempt) => attempt.prompt.id),
      scoreHistory: attempts.map((_, attemptIndex) => ({
        at: new Date().toISOString(),
        score: attempts.slice(0, attemptIndex + 1).reduce((sum, attempt) => sum + (attempt.status === "correct" ? 100 : attempt.status === "partial" ? 50 : 0), 0)
      }))
    };
    saveLocalResult(result);
    saveServerResult(result);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-monitor">Study bay</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Competency review mode</h1>
        </div>
        <select
          value={stationId}
          onChange={(event) => {
            setStationId(event.target.value);
            setIndex(0);
          }}
          className="rounded-md border border-white/10 bg-panel px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.08em] text-white outline-none"
        >
          <option value="all">All stations</option>
          {stations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["flashcards", "missed", "drill"] as StudyMode[]).map((item) => (
          <button
            key={item}
            onClick={() => setMode(item)}
            className={`rounded-md border px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] ${
              mode === item ? "border-scrub/50 bg-scrub/10 text-scrub" : "border-white/10 bg-white/[0.04] text-white/60"
            }`}
          >
            {item === "missed" ? "Review flagged" : item === "drill" ? "Self-check drill" : item}
          </button>
        ))}
      </div>

      {prompt ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {mode === "drill" ? <PromptCard prompt={prompt} showAnswer /> : <Flashcard prompt={prompt} />}
          <aside className="grid content-start gap-3 rounded-md border border-white/10 bg-black/35 p-4">
            <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">
              Prompt {Math.min(index + 1, deck.length)} of {deck.length}
            </div>
            {mode === "drill" ? (
              <>
                <AnimatedButton variant="secondary" onClick={() => drill("correct")}>
                  Correct
                </AnimatedButton>
                <AnimatedButton variant="ghost" onClick={() => drill("partial")}>
                  Partial
                </AnimatedButton>
                <AnimatedButton variant="danger" onClick={() => drill("incorrect")}>
                  Incorrect
                </AnimatedButton>
                <AnimatedButton variant="ghost" onClick={saveDrill} disabled={attempts.length === 0}>
                  Save drill
                </AnimatedButton>
              </>
            ) : (
              <>
                <AnimatedButton variant="secondary" onClick={() => markCard("gotIt")}>
                  Got It
                </AnimatedButton>
                <AnimatedButton variant="danger" onClick={() => markCard("missed")}>
                  Missed It
                </AnimatedButton>
                <AnimatedButton variant="ghost" onClick={() => markCard("review")}>
                  Needs Review
                </AnimatedButton>
                <AnimatedButton variant="ghost" onClick={() => setIndex((value) => value + 1)}>
                  <SkipForward className="h-4 w-4" />
                  Skip
                </AnimatedButton>
              </>
            )}
            <AnimatedButton
              variant="danger"
              onClick={() => {
                setAttempts([]);
                setIndex(0);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </AnimatedButton>
          </aside>
        </div>
      ) : (
        <div className="rounded-md border border-white/10 bg-black/35 p-8 text-center text-white/60">No review prompts yet.</div>
      )}
    </section>
  );
}
