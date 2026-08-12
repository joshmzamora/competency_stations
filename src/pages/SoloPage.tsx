import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eye,
  Home,
  Minus,
  RotateCcw,
  TimerReset,
  X
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityPromptLayout } from "../components/ActivityPromptLayout";
import { CountdownTimer } from "../components/CountdownTimer";
import { StationCard } from "../components/StationCard";
import { stations } from "../data/stations";
import type { ActivityState, CompetencyPrompt, EvaluationStatus } from "../types";

const gradeStyles: Record<EvaluationStatus, string> = {
  correct: "border-scrub/45 bg-scrub/10 text-scrub",
  partial: "border-amber/45 bg-amber/10 text-amber",
  incorrect: "border-trauma/45 bg-trauma/10 text-trauma"
};

type SoloTimerWindow = {
  startedAt: number | null;
  endsAt: number | null;
};

type SoloStationResult = {
  stationId: string;
  grades: Record<string, EvaluationStatus>;
  completed: number;
  correct: number;
  partial: number;
  incorrect: number;
  score: number;
  promptCount: number;
};

function initialStationId() {
  return new URLSearchParams(window.location.search).get("station") ?? "";
}

function answerKeyText(prompt: CompetencyPrompt) {
  if (!prompt.answerKey?.length) return null;
  return prompt.answerKey.map((column) => `${column.title}: ${column.items.join(", ")}`).join("\n");
}

function createSoloActivityState(prompt: CompetencyPrompt): ActivityState | null {
  if (!prompt.activity) return null;
  return {
    promptId: prompt.id,
    placements: Object.fromEntries(prompt.activity.itemBank.map((item) => [item, null])),
    checkCount: 0
  };
}

function soloActivityCheckResults(prompt: CompetencyPrompt, state: ActivityState) {
  if (!prompt.activity) return {};

  const answers = new Map<string, string>();
  for (const column of prompt.answerKey ?? []) {
    for (const item of column.items) answers.set(item, column.title);
  }

  if (prompt.activity.mode === "select") {
    const selectedColumn = prompt.activity.columns[0]?.title ?? "Selected";
    const correctItems = new Set(
      Array.from(answers.entries())
        .filter(([, column]) => column === selectedColumn)
        .map(([item]) => item)
    );

    return Object.fromEntries(
      prompt.activity.itemBank.map((item) => [
        item,
        correctItems.has(item) ? state.placements[item] === selectedColumn : state.placements[item] === null
      ])
    );
  }

  return Object.fromEntries(
    prompt.activity.itemBank.map((item) => [item, state.placements[item] === answers.get(item)])
  );
}

function timerWindow(seconds?: number): SoloTimerWindow {
  if (!seconds) return { startedAt: null, endsAt: null };
  const startedAt = Date.now();
  return { startedAt, endsAt: startedAt + seconds * 1000 };
}

function summarizeStation(station: (typeof stations)[number], grades: Record<string, EvaluationStatus>): SoloStationResult {
  const completed = station.prompts.filter((item) => grades[item.id]).length;
  const correct = station.prompts.filter((item) => grades[item.id] === "correct").length;
  const partial = station.prompts.filter((item) => grades[item.id] === "partial").length;
  const incorrect = station.prompts.filter((item) => grades[item.id] === "incorrect").length;
  const score = completed ? Math.round(((correct + partial * 0.5) / completed) * 100) : 0;

  return {
    stationId: station.id,
    grades: { ...grades },
    completed,
    correct,
    partial,
    incorrect,
    score,
    promptCount: station.prompts.length
  };
}

export function SoloPage() {
  const navigate = useNavigate();
  const [stationId, setStationId] = useState(initialStationId);
  const [promptIndex, setPromptIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [grades, setGrades] = useState<Record<string, EvaluationStatus>>({});
  const [activityStates, setActivityStates] = useState<Record<string, ActivityState>>({});
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [timer, setTimer] = useState<SoloTimerWindow>({ startedAt: null, endsAt: null });
  const [showSummary, setShowSummary] = useState(false);
  const [showOverallSummary, setShowOverallSummary] = useState(false);
  const [sessionResults, setSessionResults] = useState<Record<string, SoloStationResult>>({});

  const station = useMemo(() => stations.find((item) => item.id === stationId) ?? null, [stationId]);
  const prompt = station?.prompts[promptIndex] ?? null;

  useEffect(() => {
    setRevealed(false);
    setSelectedChoice(null);
    setTimer(timerWindow(prompt?.timerSeconds));
  }, [prompt?.id, prompt?.timerSeconds]);

  const currentResult = station ? summarizeStation(station, grades) : null;
  const sessionResultList = Object.values(sessionResults);
  const completedStations = sessionResultList.length;
  const totalCorrect = sessionResultList.reduce((sum, result) => sum + result.correct, 0);
  const totalPartial = sessionResultList.reduce((sum, result) => sum + result.partial, 0);
  const totalIncorrect = sessionResultList.reduce((sum, result) => sum + result.incorrect, 0);
  const totalCompletedPrompts = sessionResultList.reduce((sum, result) => sum + result.completed, 0);
  const overallScore = totalCompletedPrompts
    ? Math.round(((totalCorrect + totalPartial * 0.5) / totalCompletedPrompts) * 100)
    : 0;
  const allStationsComplete = completedStations === stations.length;

  function clearCurrentStation() {
    setStationId("");
    setPromptIndex(0);
    setGrades({});
    setActivityStates({});
    setSelectedChoice(null);
    setTimer({ startedAt: null, endsAt: null });
    setShowSummary(false);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("station");
    window.history.replaceState({}, "", nextUrl);
  }

  function chooseStation(id: string) {
    if (sessionResults[id]) return;
    setStationId(id);
    setPromptIndex(0);
    setGrades({});
    setActivityStates({});
    setSelectedChoice(null);
    setShowSummary(false);
    setShowOverallSummary(false);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("station", id);
    window.history.replaceState({}, "", nextUrl);
  }

  function leaveStation() {
    clearCurrentStation();
  }

  function resetSession() {
    setSessionResults({});
    setShowOverallSummary(false);
    clearCurrentStation();
  }

  function finishStation() {
    if (!station) return;
    const result = summarizeStation(station, grades);
    setSessionResults((current) => ({ ...current, [station.id]: result }));
    setShowSummary(true);
  }

  function grade(status: EvaluationStatus) {
    if (!prompt) return;
    setGrades((current) => ({ ...current, [prompt.id]: status }));
  }

  function goToPrompt(index: number) {
    if (!station) return;
    const nextIndex = Math.min(Math.max(index, 0), station.prompts.length - 1);
    const nextPrompt = station.prompts[nextIndex];
    setPromptIndex(nextIndex);
    setRevealed(false);
    setSelectedChoice(null);
    setTimer(timerWindow(nextPrompt?.timerSeconds));
  }

  function resetTimer() {
    setTimer(timerWindow(prompt?.timerSeconds));
  }

  function moveActivityCard(item: string, column: string | null) {
    if (!prompt?.activity || revealed) return;
    setActivityStates((current) => {
      const base = current[prompt.id] ?? createSoloActivityState(prompt);
      if (!base) return current;
      return {
        ...current,
        [prompt.id]: {
          ...base,
          placements: { ...base.placements, [item]: column }
        }
      };
    });
  }

  function checkActivity() {
    if (!prompt?.activity) return;
    setActivityStates((current) => {
      const base = current[prompt.id] ?? createSoloActivityState(prompt);
      if (!base || base.checkCount >= 2) return current;
      return {
        ...current,
        [prompt.id]: {
          ...base,
          checkCount: base.checkCount + 1,
          itemResults: soloActivityCheckResults(prompt, base),
          lastCheckedAt: new Date().toISOString()
        }
      };
    });
  }

  if (showOverallSummary) {
    return (
      <section className="mx-auto min-h-[calc(100vh-5rem)] max-w-7xl px-4 py-8 md:px-6">
        <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-scrub">Solo run complete</div>
        <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white md:text-7xl">Overall results</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/60">
          This score combines every graded prompt from every competency station in this run.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Overall score" value={`${overallScore}%`} tone="text-monitor" />
          <Stat label="Stations" value={`${completedStations}/${stations.length}`} />
          <Stat label="Correct" value={totalCorrect} tone="text-scrub" />
          <Stat label="Partial" value={totalPartial} tone="text-amber" />
          <Stat label="Missed" value={totalIncorrect} tone="text-trauma" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stations.map((item) => {
            const result = sessionResults[item.id];
            return (
              <div key={item.id} className="rounded-md border border-white/10 bg-black/35 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/35">Station</div>
                    <h2 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-white">{item.title}</h2>
                  </div>
                  <div className="font-display text-3xl font-black text-monitor">{result ? `${result.score}%` : "--"}</div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Correct" value={result?.correct ?? 0} tone="text-scrub" />
                  <MiniStat label="Partial" value={result?.partial ?? 0} tone="text-amber" />
                  <MiniStat label="Missed" value={result?.incorrect ?? 0} tone="text-trauma" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetSession}
            className="inline-flex min-h-14 items-center gap-2 rounded-md border border-monitor/35 bg-monitor/10 px-5 font-display text-sm font-black uppercase tracking-[0.14em] text-monitor transition hover:bg-monitor/15"
          >
            <RotateCcw className="h-5 w-5" /> Reset run
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex min-h-14 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 font-display text-sm font-black uppercase tracking-[0.14em] text-white/65 transition hover:border-white/25 hover:text-white"
          >
            <Home className="h-5 w-5" /> Home
          </button>
        </div>
      </section>
    );
  }

  if (!station) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-monitor/30 bg-monitor/10 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-monitor">
              <Brain className="h-4 w-4" /> Solo practice
            </div>
            <h1 className="mt-5 font-display text-5xl font-black uppercase leading-none text-white md:text-6xl">One Player Mode</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/65">
              Complete each station once. Finished stations lock for this run, and your scores roll into one overall result at the end.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {completedStations > 0 ? (
              <button
                type="button"
                onClick={resetSession}
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-4 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/65 transition hover:border-white/25 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" /> Reset run
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-4 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/25 hover:text-white"
            >
              <Home className="h-4 w-4" /> Home
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-md border border-white/10 bg-black/35 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white/35">Run progress</div>
              <div className="mt-2 font-display text-3xl font-black uppercase text-white">
                {completedStations}/{stations.length} stations complete
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-6 w-6 text-monitor" />
              <div>
                <div className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/35">Overall so far</div>
                <div className="font-display text-3xl font-black text-monitor">{overallScore}%</div>
              </div>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-trauma via-monitor to-scrub transition-all"
              style={{ width: `${Math.round((completedStations / Math.max(1, stations.length)) * 100)}%` }}
            />
          </div>
          <div className="mt-3 text-sm text-white/40">
            Completed stations stay locked until you reset this run or refresh the page.
          </div>
          {allStationsComplete ? (
            <button
              type="button"
              onClick={() => setShowOverallSummary(true)}
              className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-md border border-scrub/35 bg-scrub/10 px-5 font-display text-sm font-black uppercase tracking-[0.14em] text-scrub transition hover:bg-scrub/15"
            >
              <CheckCircle2 className="h-5 w-5" /> View final results
            </button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stations.map((item, index) => {
            const result = sessionResults[item.id];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035 }}
              >
                <StationCard
                  station={item}
                  completed={result ? item.prompts.length : 0}
                  disabled={Boolean(result)}
                  statusLabel={result ? `Completed · ${result.score}%` : undefined}
                  onSelect={(selected) => chooseStation(selected.id)}
                />
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  }

  if (showSummary && currentResult) {
    const savedResult = sessionResults[station.id] ?? currentResult;
    const finishedAllStations = Object.keys(sessionResults).length === stations.length;

    return (
      <section className="mx-auto min-h-[calc(100vh-5rem)] max-w-6xl px-4 py-8 md:px-6">
        <div className="p-2 md:p-4">
          <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-scrub">Station complete</div>
          <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white md:text-7xl">{station.title}</h1>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Score" value={`${savedResult.score}%`} tone="text-monitor" />
            <Stat label="Completed" value={`${savedResult.completed}/${station.prompts.length}`} />
            <Stat label="Correct" value={savedResult.correct} tone="text-scrub" />
            <Stat label="Partial" value={savedResult.partial} tone="text-amber" />
            <Stat label="Missed" value={savedResult.incorrect} tone="text-trauma" />
          </div>

          <div className="mt-8 grid gap-3">
            {station.prompts.map((item) => {
              const status = savedResult.grades[item.id];
              return (
                <div
                  key={item.id}
                  className="flex min-h-20 items-center justify-between gap-5 rounded-md border border-white/10 bg-white/[0.025] px-5 py-4 text-left"
                >
                  <span className="line-clamp-2 text-xl font-semibold leading-8 text-white/85">{item.title || item.scenario}</span>
                  <span className={`flex-none font-display text-xs font-black uppercase tracking-[0.14em] ${status ? gradeStyles[status] : "text-white/35"}`}>
                    {status ?? "Not graded"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {finishedAllStations ? (
              <button
                type="button"
                onClick={() => {
                  clearCurrentStation();
                  setShowOverallSummary(true);
                }}
                className="inline-flex min-h-14 items-center gap-2 rounded-md border border-scrub/35 bg-scrub/10 px-5 font-display text-sm font-black uppercase tracking-[0.14em] text-scrub transition hover:bg-scrub/15"
              >
                <CheckCircle2 className="h-5 w-5" /> View final results
              </button>
            ) : (
              <button
                type="button"
                onClick={clearCurrentStation}
                className="inline-flex min-h-14 items-center gap-2 rounded-md border border-monitor/35 bg-monitor/10 px-5 font-display text-sm font-black uppercase tracking-[0.14em] text-monitor transition hover:bg-monitor/15"
              >
                <ArrowLeft className="h-5 w-5" /> Choose next station
              </button>
            )}
            <button
              type="button"
              onClick={resetSession}
              className="inline-flex min-h-14 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 font-display text-sm font-black uppercase tracking-[0.14em] text-white/55 transition hover:border-white/25 hover:text-white"
            >
              <RotateCcw className="h-5 w-5" /> Reset run
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!prompt) return null;

  const answerKey = answerKeyText(prompt);
  const currentGrade = grades[prompt.id];
  const atLastPrompt = promptIndex === station.prompts.length - 1;
  const activityState = prompt.activity
    ? activityStates[prompt.id] ?? createSoloActivityState(prompt) ?? undefined
    : undefined;

  return (
    <section className="flex min-h-[calc(100vh-5rem)] w-full flex-col px-3 py-3 md:px-6 md:py-4 xl:px-10">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={leaveStation}
          className="inline-flex min-h-11 items-center gap-2 px-1 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/45 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Stations
        </button>

        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden text-right sm:block">
            <div className="font-display text-base font-black uppercase text-white md:text-lg">{station.shortTitle}</div>
          </div>
          <div className="font-display text-base font-black text-white/45 md:text-lg">
            {promptIndex + 1}/{station.prompts.length}
          </div>
        </div>
      </div>

      {prompt.timerSeconds && (
        <div className="my-3 md:my-4">
          <CountdownTimer
            endsAt={timer.endsAt}
            startedAt={timer.startedAt}
            audioEnabled={false}
          />
        </div>
      )}

      <main className="flex flex-1 flex-col">
        {prompt.timerSeconds && (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={resetTimer}
              className="inline-flex items-center gap-1.5 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.12em] text-white/40 transition hover:text-white"
            >
              <TimerReset className="h-4 w-4" /> Restart timer
            </button>
          </div>
        )}

        {prompt.activity && activityState ? (
          <div className="flex-1">
            <ActivityPromptLayout
              prompt={prompt}
              activityState={activityState}
              showAnswer={revealed}
              readOnly={revealed}
              audioEnabled={false}
              size="learner"
              onMoveCard={moveActivityCard}
              onCheck={checkActivity}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center py-4 md:py-8">
            {prompt.title && (
              <h1 className="mb-5 font-display text-3xl font-black uppercase leading-tight text-monitor md:text-4xl xl:text-5xl">
                {prompt.title}
              </h1>
            )}

            <p className="max-w-[1600px] text-4xl font-semibold leading-[1.08] text-white md:text-6xl xl:text-7xl 2xl:text-8xl">
              {prompt.scenario}
            </p>

            {prompt.choices && prompt.choices.length > 0 && (
              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:gap-5">
                {prompt.choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    disabled={revealed}
                    onClick={() => setSelectedChoice(choice)}
                    className={`min-h-24 rounded-md border p-6 text-left text-2xl font-semibold leading-tight transition md:min-h-28 md:p-7 md:text-3xl xl:text-4xl ${selectedChoice === choice ? "border-monitor/50 bg-monitor/10 text-white" : "border-white/10 bg-white/[0.025] text-white/75 hover:border-white/25"}`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-6 inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-md border border-scrub/35 bg-scrub/10 px-6 font-display text-lg font-black uppercase tracking-[0.14em] text-scrub transition hover:bg-scrub/15 md:min-h-20 md:text-xl"
          >
            <Eye className="h-6 w-6" /> Reveal answer
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid gap-5">
            <div className="border-l-4 border-scrub pl-5 md:pl-7">
              <div className="font-display text-xs font-black uppercase tracking-[0.18em] text-scrub md:text-sm">Expected response</div>
              <p className="mt-3 whitespace-pre-line text-2xl font-medium leading-snug text-white/95 md:text-3xl xl:text-4xl">{prompt.expectedResponse}</p>
            </div>

            {answerKey && !prompt.activity && (
              <div className="border-l-4 border-monitor pl-5 md:pl-7">
                <div className="font-display text-xs font-black uppercase tracking-[0.18em] text-monitor md:text-sm">Answer key</div>
                <p className="mt-3 whitespace-pre-line text-xl leading-relaxed text-white/80 md:text-2xl xl:text-3xl">{answerKey}</p>
              </div>
            )}

            {prompt.explanation && (
              <div className="border-l-4 border-white/20 pl-5 md:pl-7">
                <div className="font-display text-xs font-black uppercase tracking-[0.18em] text-white/40 md:text-sm">Why it matters</div>
                <p className="mt-3 text-xl leading-relaxed text-white/70 md:text-2xl xl:text-3xl">{prompt.explanation}</p>
              </div>
            )}

            {prompt.criticalActions && prompt.criticalActions.length > 0 && (
              <Checklist title="Critical actions" items={prompt.criticalActions} />
            )}

            {prompt.notifyProviderWhen && prompt.notifyProviderWhen.length > 0 && (
              <Checklist title="Notify provider when" items={prompt.notifyProviderWhen} />
            )}
          </motion.div>
        )}
      </main>

      <div className="mt-5 border-t border-white/10 pt-4 md:mt-6 md:pt-5">
        {revealed && (
          <div className="grid gap-3 md:grid-cols-3">
            <GradeButton
              label="Correct"
              icon={<Check className="h-6 w-6" />}
              active={currentGrade === "correct"}
              disabled={false}
              className={gradeStyles.correct}
              onClick={() => grade("correct")}
            />
            <GradeButton
              label="Partial"
              icon={<Minus className="h-6 w-6" />}
              active={currentGrade === "partial"}
              disabled={false}
              className={gradeStyles.partial}
              onClick={() => grade("partial")}
            />
            <GradeButton
              label="Missed"
              icon={<X className="h-6 w-6" />}
              active={currentGrade === "incorrect"}
              disabled={false}
              className={gradeStyles.incorrect}
              onClick={() => grade("incorrect")}
            />
          </div>
        )}

        <div className={`${revealed ? "mt-3" : ""} grid grid-cols-2 gap-3`}>
          <button
            type="button"
            onClick={() => goToPrompt(promptIndex - 1)}
            disabled={promptIndex === 0}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md px-5 font-display text-sm font-black uppercase tracking-[0.12em] text-white/45 transition hover:bg-white/[0.035] hover:text-white disabled:opacity-20 md:min-h-16 md:text-base"
          >
            <ChevronLeft className="h-6 w-6" /> Previous
          </button>
          <button
            type="button"
            onClick={() => atLastPrompt ? finishStation() : goToPrompt(promptIndex + 1)}
            disabled={!currentGrade}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-monitor/10 px-5 font-display text-sm font-black uppercase tracking-[0.12em] text-monitor transition hover:bg-monitor/15 disabled:cursor-not-allowed disabled:opacity-20 md:min-h-16 md:text-base"
          >
            {atLastPrompt ? "Finish" : "Next"} <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}

function GradeButton({
  label,
  icon,
  active,
  disabled,
  className,
  onClick
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  disabled: boolean;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-16 items-center justify-between rounded-md border px-5 font-display text-base font-black uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-25 md:min-h-20 md:px-6 md:text-lg ${active ? `${className} ring-1 ring-current` : "border-white/10 bg-white/[0.025] text-white/55 hover:border-white/25"}`}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-l-4 border-amber pl-5 md:pl-7">
      <div className="font-display text-xs font-black uppercase tracking-[0.18em] text-amber md:text-sm">{title}</div>
      <ul className="mt-3 grid gap-3 text-xl leading-relaxed text-white/75 md:text-2xl xl:text-3xl">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <Check className="mt-1.5 h-5 w-5 flex-none text-amber md:h-6 md:w-6" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, tone = "text-white" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.025] p-3 text-center md:p-4">
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 md:text-xs">{label}</div>
      <div className={`mt-1 font-display text-2xl font-black md:text-3xl ${tone}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-3">
      <div className="font-display text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">{label}</div>
      <div className={`mt-1 font-display text-xl font-black ${tone}`}>{value}</div>
    </div>
  );
}
