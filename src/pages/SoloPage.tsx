import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Home,
  Minus,
  RotateCcw,
  TimerReset,
  X
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StationCard } from "../components/StationCard";
import { stations } from "../data/stations";
import type { CompetencyPrompt, EvaluationStatus } from "../types";

const gradeStyles: Record<EvaluationStatus, string> = {
  correct: "border-scrub/45 bg-scrub/10 text-scrub",
  partial: "border-amber/45 bg-amber/10 text-amber",
  incorrect: "border-trauma/45 bg-trauma/10 text-trauma"
};

function initialStationId() {
  return new URLSearchParams(window.location.search).get("station") ?? "";
}

function answerKeyText(prompt: CompetencyPrompt) {
  if (!prompt.answerKey?.length) return null;
  return prompt.answerKey.map((column) => `${column.title}: ${column.items.join(", ")}`).join("\n");
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function SoloPage() {
  const navigate = useNavigate();
  const [stationId, setStationId] = useState(initialStationId);
  const [promptIndex, setPromptIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [grades, setGrades] = useState<Record<string, EvaluationStatus>>({});
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const station = useMemo(() => stations.find((item) => item.id === stationId) ?? null, [stationId]);
  const prompt = station?.prompts[promptIndex] ?? null;

  useEffect(() => {
    setRevealed(false);
    setSelectedChoice(null);
    setTimerRunning(false);
    setTimeLeft(prompt?.timerSeconds ?? null);
  }, [prompt?.id, prompt?.timerSeconds]);

  useEffect(() => {
    if (!timerRunning || timeLeft === null || timeLeft <= 0) return;
    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current === null || current <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const completed = station ? station.prompts.filter((item) => grades[item.id]).length : 0;
  const correct = station ? station.prompts.filter((item) => grades[item.id] === "correct").length : 0;
  const partial = station ? station.prompts.filter((item) => grades[item.id] === "partial").length : 0;
  const incorrect = station ? station.prompts.filter((item) => grades[item.id] === "incorrect").length : 0;
  const score = completed ? Math.round(((correct + partial * 0.5) / completed) * 100) : 0;

  function chooseStation(id: string) {
    setStationId(id);
    setPromptIndex(0);
    setGrades({});
    setShowSummary(false);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("station", id);
    window.history.replaceState({}, "", nextUrl);
  }

  function leaveStation() {
    setStationId("");
    setPromptIndex(0);
    setGrades({});
    setShowSummary(false);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("station");
    window.history.replaceState({}, "", nextUrl);
  }

  function grade(status: EvaluationStatus) {
    if (!prompt) return;
    setGrades((current) => ({ ...current, [prompt.id]: status }));
  }

  function goToPrompt(index: number) {
    if (!station) return;
    setPromptIndex(Math.min(Math.max(index, 0), station.prompts.length - 1));
  }

  function resetTimer() {
    if (!prompt?.timerSeconds) return;
    setTimerRunning(false);
    setTimeLeft(prompt.timerSeconds);
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
              Practice any competency station on one computer. Answer each prompt yourself, reveal the expected response, then grade your own attempt before moving on.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-4 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/25 hover:text-white"
          >
            <Home className="h-4 w-4" /> Home
          </button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stations.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035 }}
            >
              <StationCard station={item} onSelect={(selected) => chooseStation(selected.id)} />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (showSummary) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-md border border-white/10 bg-black/40 p-6 md:p-8">
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-scrub">Solo station complete</div>
          <h1 className="mt-3 font-display text-4xl font-black uppercase leading-none text-white md:text-5xl">{station.title}</h1>
          <p className="mt-4 text-white/60">Self-graded practice summary</p>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Score" value={`${score}%`} tone="text-monitor" />
            <Stat label="Completed" value={`${completed}/${station.prompts.length}`} />
            <Stat label="Correct" value={correct} tone="text-scrub" />
            <Stat label="Partial" value={partial} tone="text-amber" />
            <Stat label="Missed" value={incorrect} tone="text-trauma" />
          </div>

          <div className="mt-8 grid gap-2">
            {station.prompts.map((item, index) => {
              const status = grades[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setShowSummary(false);
                    goToPrompt(index);
                  }}
                  className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-4 py-3 text-left transition hover:border-monitor/30"
                >
                  <span className="font-display text-sm font-bold uppercase text-white/75">Prompt {index + 1}</span>
                  <span className={`font-display text-[10px] font-black uppercase tracking-[0.14em] ${status ? gradeStyles[status] : "text-white/35"}`}>
                    {status ?? "Not graded"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setPromptIndex(0);
                setGrades({});
                setShowSummary(false);
              }}
              className="inline-flex min-h-12 items-center gap-2 rounded-md border border-monitor/35 bg-monitor/10 px-4 font-display text-xs font-black uppercase tracking-[0.14em] text-monitor transition hover:bg-monitor/15"
            >
              <RotateCcw className="h-4 w-4" /> Practice again
            </button>
            <button
              type="button"
              onClick={leaveStation}
              className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 font-display text-xs font-black uppercase tracking-[0.14em] text-white/65 transition hover:border-white/25 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Choose another station
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
  const timerExpired = timeLeft === 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={leaveStation}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/55 transition hover:border-white/25 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Stations
        </button>
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Solo practice</div>
            <div className="font-display text-sm font-black uppercase text-white">{station.shortTitle}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/35 px-3 py-2 font-display text-sm font-black text-monitor">
            {promptIndex + 1}/{station.prompts.length}
          </div>
        </div>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-monitor to-scrub transition-all duration-300"
          style={{ width: `${((promptIndex + 1) / station.prompts.length) * 100}%` }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <main className="rounded-md border border-white/10 bg-black/40 p-5 md:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-monitor/30 bg-monitor/10 px-3 py-1.5 font-display text-[10px] font-black uppercase tracking-[0.16em] text-monitor">
              {prompt.type.replace(/-/g, " ")}
            </span>
            {prompt.timerSeconds && (
              <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-display text-[10px] font-black uppercase tracking-[0.16em] ${timerExpired ? "border-trauma/45 bg-trauma/10 text-trauma" : "border-amber/30 bg-amber/10 text-amber"}`}>
                <Clock3 className="h-3.5 w-3.5" /> {timeLeft === null ? formatTime(prompt.timerSeconds) : formatTime(timeLeft)}
              </span>
            )}
          </div>

          <h1 className="mt-6 font-display text-3xl font-black uppercase leading-tight text-white md:text-4xl">
            {prompt.title || `Prompt ${promptIndex + 1}`}
          </h1>
          <p className="mt-5 text-xl leading-8 text-white/90">{prompt.scenario}</p>

          {prompt.instructions.length > 0 && (
            <div className="mt-6 rounded-md border border-white/10 bg-white/[0.035] p-4">
              <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">What to do</div>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/65">
                {prompt.instructions.map((instruction) => (
                  <li key={instruction} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-monitor" />
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {prompt.choices && prompt.choices.length > 0 && (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {prompt.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelectedChoice(choice)}
                  className={`rounded-md border p-4 text-left text-sm leading-6 transition ${selectedChoice === choice ? "border-monitor/50 bg-monitor/10 text-white" : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25"}`}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {prompt.activity && (
            <div className="mt-6 rounded-md border border-white/10 bg-white/[0.03] p-4">
              <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Activity cards</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {prompt.activity.itemBank.map((item) => (
                  <span key={item} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/70">{item}</span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-white/45">Work through the activity yourself, then reveal the answer key below.</p>
            </div>
          )}

          {prompt.timerSeconds && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTimerRunning((running) => !running)}
                disabled={timeLeft === 0}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-amber/35 bg-amber/10 px-4 font-display text-[11px] font-black uppercase tracking-[0.14em] text-amber disabled:opacity-40"
              >
                <Clock3 className="h-4 w-4" /> {timerRunning ? "Pause timer" : timeLeft === prompt.timerSeconds ? "Start timer" : "Resume timer"}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-4 font-display text-[11px] font-black uppercase tracking-[0.14em] text-white/55"
              >
                <TimerReset className="h-4 w-4" /> Reset
              </button>
            </div>
          )}

          {!revealed ? (
            <button
              type="button"
              onClick={() => {
                setRevealed(true);
                setTimerRunning(false);
              }}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md border border-scrub/40 bg-scrub/10 px-5 font-display text-xs font-black uppercase tracking-[0.16em] text-scrub transition hover:bg-scrub/15"
            >
              <Eye className="h-4 w-4" /> Reveal answer
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-7 grid gap-4">
              <div className="rounded-md border border-scrub/30 bg-scrub/[0.07] p-5">
                <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-scrub">Expected response</div>
                <p className="mt-3 whitespace-pre-line text-base leading-7 text-white/85">{prompt.expectedResponse}</p>
              </div>

              {answerKey && (
                <div className="rounded-md border border-monitor/25 bg-monitor/[0.06] p-5">
                  <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-monitor">Answer key</div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/75">{answerKey}</p>
                </div>
              )}

              {prompt.explanation && (
                <div className="rounded-md border border-white/10 bg-white/[0.035] p-5">
                  <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Why it matters</div>
                  <p className="mt-3 text-sm leading-7 text-white/65">{prompt.explanation}</p>
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

        <aside className="grid content-start gap-4">
          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Self grade</div>
            <p className="mt-2 text-sm leading-6 text-white/55">Reveal the answer first, then score how close your response was.</p>
            <div className="mt-4 grid gap-2">
              <GradeButton
                label="Correct"
                icon={<Check className="h-4 w-4" />}
                active={currentGrade === "correct"}
                disabled={!revealed}
                className={gradeStyles.correct}
                onClick={() => grade("correct")}
              />
              <GradeButton
                label="Partial"
                icon={<Minus className="h-4 w-4" />}
                active={currentGrade === "partial"}
                disabled={!revealed}
                className={gradeStyles.partial}
                onClick={() => grade("partial")}
              />
              <GradeButton
                label="Missed"
                icon={<X className="h-4 w-4" />}
                active={currentGrade === "incorrect"}
                disabled={!revealed}
                className={gradeStyles.incorrect}
                onClick={() => grade("incorrect")}
              />
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-black/40 p-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <MiniStat label="Done" value={completed} />
              <MiniStat label="Right" value={correct} tone="text-scrub" />
              <MiniStat label="Part" value={partial} tone="text-amber" />
              <MiniStat label="Miss" value={incorrect} tone="text-trauma" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Current score</div>
                <div className="mt-1 font-display text-2xl font-black text-monitor">{score}%</div>
              </div>
              {revealed && (
                <button
                  type="button"
                  onClick={() => setRevealed(false)}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/45"
                >
                  <Eye className="h-3.5 w-3.5" /> Hide answer
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => goToPrompt(promptIndex - 1)}
              disabled={promptIndex === 0}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 font-display text-[10px] font-black uppercase tracking-[0.12em] text-white/55 transition disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              type="button"
              onClick={() => atLastPrompt ? setShowSummary(true) : goToPrompt(promptIndex + 1)}
              disabled={!currentGrade}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-monitor/35 bg-monitor/10 px-3 font-display text-[10px] font-black uppercase tracking-[0.12em] text-monitor transition disabled:cursor-not-allowed disabled:opacity-30"
            >
              {atLastPrompt ? "Finish" : "Next"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
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
      className={`flex min-h-12 items-center justify-between rounded-md border px-4 font-display text-xs font-black uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-25 ${active ? `${className} ring-1 ring-current` : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25"}`}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-amber/20 bg-amber/[0.05] p-5">
      <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-amber">{title}</div>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/65">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-1 h-4 w-4 flex-none text-amber" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, tone = "text-white" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-center">
      <div className="font-display text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">{label}</div>
      <div className={`mt-1 font-display text-2xl font-black ${tone}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, tone = "text-white" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-md bg-white/[0.035] p-2">
      <div className="font-display text-[8px] font-bold uppercase tracking-[0.1em] text-white/30">{label}</div>
      <div className={`mt-1 font-display text-lg font-black ${tone}`}>{value}</div>
    </div>
  );
}
