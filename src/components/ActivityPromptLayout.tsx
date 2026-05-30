import { motion } from "framer-motion";
import { CheckCircle2, ClipboardList, MoveRight, RotateCcw } from "lucide-react";
import type { ActivityColumn, ActivityState, CompetencyPrompt, PlayerPrompt } from "../types";

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(~~.*?~~)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("~~") && part.endsWith("~~")) {
          return <s key={`${part}-${index}`} className="text-white/35">{part.slice(2, -2)}</s>;
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function ActivityCard({
  item,
  result,
  readOnly,
  onDragStart
}: {
  item: string;
  result?: boolean;
  readOnly?: boolean;
  onDragStart: (item: string) => void;
}) {
  const resultClass =
    result === true
      ? "border-scrub/55 bg-scrub/10 text-white shadow-[0_0_20px_rgba(34,245,199,0.1)]"
      : result === false
        ? "border-trauma/55 bg-trauma/10 text-white shadow-[0_0_20px_rgba(255,48,77,0.1)]"
        : "border-white/10 bg-black/35 text-white/78";

  return (
    <div
      draggable={!readOnly}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", item);
        onDragStart(item);
      }}
      className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${resultClass} ${readOnly ? "" : "cursor-grab active:cursor-grabbing"}`}
    >
      <FormattedText text={item} />
    </div>
  );
}

function WorkColumns({
  columns,
  placements,
  itemResults,
  readOnly,
  onMove
}: {
  columns: ActivityColumn[];
  placements: Record<string, string | null>;
  itemResults?: Record<string, boolean>;
  readOnly?: boolean;
  onMove?: (item: string, column: string | null) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {columns.map((column) => (
        <div
          key={column.title}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const item = event.dataTransfer.getData("text/plain");
            if (item) onMove?.(item, column.title);
          }}
          className="min-h-[170px] rounded-md border border-white/10 bg-black/30 p-4"
        >
          <div className="font-display text-xs font-black uppercase tracking-[0.18em] text-monitor">{column.title}</div>
          <div className="mt-4 flex min-h-[105px] flex-wrap content-start gap-2 rounded-md border border-dashed border-white/15 bg-white/[0.025] p-3">
            {Object.entries(placements)
              .filter(([, placedColumn]) => placedColumn === column.title)
              .map(([item]) => (
                <ActivityCard
                  key={item}
                  item={item}
                  result={itemResults?.[item]}
                  readOnly={readOnly}
                  onDragStart={() => undefined}
                />
              ))}
            {!Object.values(placements).includes(column.title) && (
              <div className="grid min-h-[76px] flex-1 place-items-center px-4 text-center text-sm text-white/30">
                Drop cards here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnswerKey({ answerKey }: { answerKey: ActivityColumn[] }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-center gap-2 font-display text-xs font-black uppercase tracking-[0.18em] text-white/45">
        <CheckCircle2 className="h-4 w-4 text-scrub" />
        Host answer key
      </div>
      <div className="grid gap-3">
        {answerKey.map((column) => (
          <div key={column.title} className="rounded-md border border-white/10 bg-black/25 p-3">
            <div className="font-display text-[11px] font-black uppercase tracking-[0.16em] text-scrub">{column.title}</div>
            <ul className="mt-2 grid gap-1.5 text-sm leading-5 text-white/64">
              {column.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-white/30" />
                  <span><FormattedText text={item} /></span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityPromptLayout({
  prompt,
  showAnswer = false,
  activityState,
  readOnly = false,
  onMoveCard,
  onCheck
}: {
  prompt: CompetencyPrompt | PlayerPrompt;
  showAnswer?: boolean;
  activityState?: ActivityState;
  readOnly?: boolean;
  onMoveCard?: (item: string, column: string | null) => void;
  onCheck?: () => void;
}) {
  const hostPrompt = prompt as CompetencyPrompt;
  const answerKey = showAnswer ? hostPrompt.answerKey : undefined;
  const activity = prompt.activity;

  if (!activity) return null;

  const placements = activityState?.placements ?? Object.fromEntries(activity.itemBank.map((item) => [item, null]));
  const itemResults = activityState?.itemResults;
  const checkCount = activityState?.checkCount ?? 0;
  const correctCount = itemResults ? Object.values(itemResults).filter(Boolean).length : 0;
  const allCorrect = Boolean(itemResults) && correctCount === activity.itemBank.length;
  const visibleItemResults = showAnswer ? itemResults : undefined;
  const remainingChecks = Math.max(0, 2 - checkCount);
  const unassignedItems = activity.itemBank.filter((item) => !placements[item]);

  return (
    <motion.div
      key={prompt.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="grid gap-4"
    >
      <div className="rounded-md border border-monitor/25 bg-black/45 p-5 shadow-[0_0_38px_rgba(110,247,255,0.08)] md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-sm border border-monitor/35 bg-monitor/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] text-monitor">
            Activity
          </span>
          {showAnswer ? (
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Learner screen mirror
            </span>
          ) : null}
        </div>

        <p className="mt-5 text-2xl leading-9 text-white/80">{activity.question || prompt.scenario}</p>

        <div className="mt-6 rounded-md border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center gap-2 font-display text-xs font-black uppercase tracking-[0.18em] text-white/45">
            <ClipboardList className="h-4 w-4 text-monitor" />
            {activity.itemBankLabel}
          </div>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const item = event.dataTransfer.getData("text/plain");
              if (item) onMoveCard?.(item, null);
            }}
            className="flex min-h-[56px] flex-wrap gap-2 rounded-md border border-dashed border-white/10 bg-black/20 p-3"
          >
            {unassignedItems.map((item) => (
              <ActivityCard
                key={item}
                item={item}
                result={visibleItemResults?.[item]}
                readOnly={readOnly}
                onDragStart={() => undefined}
              />
            ))}
            {!unassignedItems.length && (
              <div className="grid min-h-10 flex-1 place-items-center text-sm text-white/30">
                All cards placed
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm text-white/45">
          <MoveRight className="h-4 w-4 text-monitor" />
          Sort the cards into the correct column.
        </div>

        <div className="mt-4">
          <WorkColumns
            columns={activity.columns}
            placements={placements}
            itemResults={visibleItemResults}
            readOnly={readOnly}
            onMove={onMoveCard}
          />
        </div>

        {!readOnly ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div>
              <div className="font-display text-xs font-black uppercase tracking-[0.18em] text-white/45">Checks</div>
              <div className="mt-1 flex gap-1.5">
                {[0, 1].map((index) => (
                  <span
                    key={index}
                    className={`h-2.5 w-8 rounded-full ${index < checkCount ? "bg-monitor" : "bg-white/12"}`}
                  />
                ))}
              </div>
            </div>
            {itemResults ? (
              <div
                className={`rounded-md border px-5 py-3 text-center font-display text-2xl font-black uppercase tracking-[0.16em] ${
                  allCorrect
                    ? "border-scrub/45 bg-scrub/10 text-scrub shadow-[0_0_28px_rgba(34,245,199,0.12)]"
                    : "border-trauma/45 bg-trauma/10 text-trauma shadow-[0_0_28px_rgba(255,48,77,0.12)]"
                }`}
              >
                {allCorrect ? "Correct" : "Incorrect"}
              </div>
            ) : (
              <div className="text-sm text-white/45">{remainingChecks} checks available</div>
            )}
            <button
              type="button"
              onClick={onCheck}
              disabled={!onCheck || remainingChecks <= 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-monitor/35 bg-monitor/10 px-4 py-2 font-display text-xs font-black uppercase tracking-[0.14em] text-monitor transition hover:bg-monitor/15 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <RotateCcw className="h-4 w-4" />
              Check
            </button>
          </div>
        ) : itemResults ? (
          <div className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-3 font-display text-sm font-black uppercase tracking-[0.12em] text-white/70">
            Learner check {checkCount}/2: {correctCount}/{activity.itemBank.length} correct
          </div>
        ) : null}
      </div>

      {answerKey?.length ? <AnswerKey answerKey={answerKey} /> : null}
    </motion.div>
  );
}
