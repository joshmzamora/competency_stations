import type { Question } from "../types";

export function QuestionCard({ question, revealed }: { question: Question | null; revealed?: boolean }) {
  if (!question) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-md border border-white/10 bg-black/35 p-8 text-center">
        <div>
          <div className="font-display text-sm uppercase tracking-[0.2em] text-monitor">Stand by</div>
          <p className="mt-3 text-white/60">No station prompt is active.</p>
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-md border border-scrub/35 bg-black/45 p-6 shadow-scrub">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-sm border border-scrub/40 bg-scrub/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] text-scrub">
          {question.category}
        </span>
        <span className="font-display text-xl font-bold text-amber">{question.points}</span>
      </div>
      <h2 className="mt-6 font-display text-3xl font-bold leading-tight text-white md:text-4xl">{question.prompt}</h2>
      {question.choices && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {question.choices.map((choice) => (
            <div key={choice} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-white/75">
              {choice}
            </div>
          ))}
        </div>
      )}
      {revealed && (
        <div className="mt-6 rounded-md border border-trauma/30 bg-trauma/10 p-4">
          <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-trauma">Correct answer</div>
          <p className="mt-2 text-lg font-semibold text-white">{question.answer}</p>
          <p className="mt-2 text-sm leading-6 text-white/70">{question.explanation}</p>
        </div>
      )}
    </article>
  );
}
