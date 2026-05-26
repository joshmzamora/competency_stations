import { RotateCcw, SkipForward } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { Flashcard } from "../components/Flashcard";
import { QuestionCard } from "../components/QuestionCard";
import { stationCategories, questions } from "../data/questions";
import type { Question } from "../types";
import { buildCategoryBreakdown, getStudyProgress, saveLocalResult, saveServerResult, saveStudyProgress } from "../utils/results";

type StudyMode = "flashcards" | "missed" | "quiz";

export function StudyPage() {
  const [mode, setMode] = useState<StudyMode>("flashcards");
  const [category, setCategory] = useState<string>("All");
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(getStudyProgress);
  const [quizIndex, setQuizIndex] = useState(0);
  const [attempts, setAttempts] = useState<Array<{ question: Question; correct: boolean; responseMs: number }>>([]);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [startedAt, setStartedAt] = useState(Date.now());

  const filtered = useMemo(() => questions.filter((question) => category === "All" || question.category === category), [category]);
  const missedCards = useMemo(() => questions.filter((question) => progress.missed.includes(question.id) || progress.review.includes(question.id)), [progress]);
  const deck = mode === "missed" ? missedCards : filtered;
  const card = deck[index % Math.max(1, deck.length)];
  const quizQuestions = useMemo(() => filtered.filter((question) => question.choices?.length), [filtered]);
  const quizQuestion = quizQuestions[quizIndex % Math.max(1, quizQuestions.length)];
  const latestAttempt = attempts.at(-1);

  function markCard(bucket: "gotIt" | "missed" | "review") {
    if (!card) return;
    const next = {
      gotIt: progress.gotIt.filter((id) => id !== card.id),
      missed: progress.missed.filter((id) => id !== card.id),
      review: progress.review.filter((id) => id !== card.id)
    };
    next[bucket].push(card.id);
    setProgress(next);
    saveStudyProgress(next);
    setIndex((value) => value + 1);
  }

  function submitChoice(choice: string) {
    if (!quizQuestion || selectedChoice) return;
    setSelectedChoice(choice);
    setAttempts((value) => [
      ...value,
      {
        question: quizQuestion,
        correct: choice === quizQuestion.answer,
        responseMs: Date.now() - startedAt
      }
    ]);
  }

  function nextQuiz() {
    setSelectedChoice("");
    setQuizIndex((value) => value + 1);
    setStartedAt(Date.now());
  }

  function saveQuiz() {
    const correct = attempts.filter((attempt) => attempt.correct).length;
    const result = {
      id: crypto.randomUUID(),
      mode: "quick-quiz" as const,
      createdAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      score: correct * 100,
      answered: attempts.length,
      correct,
      incorrect: attempts.length - correct,
      accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
      averageResponseMs: attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.responseMs, 0) / attempts.length) : 0,
      categoryBreakdown: buildCategoryBreakdown(attempts),
      missedQuestionIds: attempts.filter((attempt) => !attempt.correct).map((attempt) => attempt.question.id),
      scoreHistory: attempts.map((attempt, attemptIndex) => ({
        at: new Date().toISOString(),
        score: attempts.slice(0, attemptIndex + 1).filter((item) => item.correct).length * 100
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
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Flashcards and quick quiz</h1>
        </div>
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setIndex(0);
            setQuizIndex(0);
          }}
          className="rounded-md border border-white/10 bg-panel px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.08em] text-white outline-none"
        >
          <option>All</option>
          {stationCategories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["flashcards", "missed", "quiz"] as StudyMode[]).map((item) => (
          <button
            key={item}
            onClick={() => setMode(item)}
            className={`rounded-md border px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] ${
              mode === item ? "border-scrub/50 bg-scrub/10 text-scrub" : "border-white/10 bg-white/[0.04] text-white/60"
            }`}
          >
            {item === "missed" ? "Review missed" : item}
          </button>
        ))}
      </div>

      {mode === "quiz" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div>
            <QuestionCard question={quizQuestion} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quizQuestion?.choices?.map((choice) => {
                const isSelected = selectedChoice === choice;
                const isCorrect = selectedChoice && choice === quizQuestion.answer;
                return (
                  <button
                    key={choice}
                    onClick={() => submitChoice(choice)}
                    className={`rounded-md border p-4 text-left text-white transition ${
                      isCorrect
                        ? "border-scrub/50 bg-scrub/15"
                        : isSelected
                          ? "border-trauma/50 bg-trauma/15"
                          : "border-white/10 bg-white/[0.04] hover:border-monitor/40"
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {selectedChoice && (
              <div className="mt-4 rounded-md border border-white/10 bg-black/35 p-4">
                <div className="font-display text-sm font-bold uppercase tracking-[0.16em] text-monitor">
                  {latestAttempt?.correct ? "Correct" : "Not quite"}
                </div>
                <p className="mt-2 text-white/70">{quizQuestion.explanation}</p>
              </div>
            )}
          </div>
          <aside className="grid content-start gap-3 rounded-md border border-white/10 bg-black/35 p-4">
            <div className="font-display text-4xl font-black text-white">
              {attempts.filter((attempt) => attempt.correct).length}/{attempts.length}
            </div>
            <AnimatedButton variant="secondary" onClick={nextQuiz} disabled={!selectedChoice}>
              <SkipForward className="h-4 w-4" />
              Next
            </AnimatedButton>
            <AnimatedButton variant="ghost" onClick={saveQuiz} disabled={attempts.length === 0}>
              Save quiz result
            </AnimatedButton>
            <AnimatedButton
              variant="danger"
              onClick={() => {
                setAttempts([]);
                setSelectedChoice("");
                setQuizIndex(0);
                setStartedAt(Date.now());
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </AnimatedButton>
          </aside>
        </div>
      ) : card ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <Flashcard question={card} />
          <aside className="grid content-start gap-3 rounded-md border border-white/10 bg-black/35 p-4">
            <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">
              Card {Math.min(index + 1, deck.length)} of {deck.length}
            </div>
            <AnimatedButton variant="secondary" onClick={() => markCard("gotIt")}>
              Got It
            </AnimatedButton>
            <AnimatedButton variant="danger" onClick={() => markCard("missed")}>
              Missed It
            </AnimatedButton>
            <AnimatedButton variant="ghost" onClick={() => markCard("review")}>
              Needs Review
            </AnimatedButton>
          </aside>
        </div>
      ) : (
        <div className="rounded-md border border-white/10 bg-black/35 p-8 text-center text-white/60">No review cards yet.</div>
      )}
    </section>
  );
}
