import { motion } from "framer-motion";
import { CheckCircle2, ClipboardList, MoveRight, RotateCcw } from "lucide-react";
import type { ActivityColumn, ActivityState, CompetencyPrompt, PlayerPrompt, PromptActivity } from "../types";
import { playActivityCheckCue, playActivityDropCue } from "../utils/sound";

type ActivityLayoutSize = "standard" | "learner";

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
  size = "standard",
  onDragStart
}: {
  item: string;
  result?: boolean;
  readOnly?: boolean;
  size?: ActivityLayoutSize;
  onDragStart: (item: string) => void;
}) {
  const sizeClass =
    size === "learner"
      ? "min-h-[76px] px-5 py-4 text-2xl font-bold leading-8 md:text-3xl md:leading-10"
      : "px-3 py-2 text-sm font-semibold";
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
      className={`rounded-md border transition ${sizeClass} ${resultClass} ${readOnly ? "" : "cursor-grab active:cursor-grabbing"}`}
    >
      <FormattedText text={item} />
    </div>
  );
}

function SelectableOptionCard({
  item,
  selected,
  result,
  readOnly,
  size = "standard",
  onToggle
}: {
  item: string;
  selected: boolean;
  result?: boolean;
  readOnly?: boolean;
  size?: ActivityLayoutSize;
  onToggle: (item: string) => void;
}) {
  const learner = size === "learner";
  const resultClass =
    result === true
      ? "border-scrub/55 bg-scrub/10 text-white shadow-[0_0_20px_rgba(34,245,199,0.1)]"
      : result === false
        ? "border-trauma/55 bg-trauma/10 text-white shadow-[0_0_20px_rgba(255,48,77,0.1)]"
        : selected
          ? "border-monitor/55 bg-monitor/12 text-white shadow-[0_0_20px_rgba(110,247,255,0.12)]"
          : "border-white/10 bg-black/35 text-white/76";

  return (
    <button
      type="button"
      onClick={() => onToggle(item)}
      disabled={readOnly}
      className={`flex items-start rounded-md border text-left font-semibold transition ${learner ? "min-h-[88px] gap-4 px-5 py-4 text-2xl leading-8 md:text-3xl md:leading-10" : "min-h-[52px] gap-3 px-3 py-2 text-sm leading-5"} ${resultClass} ${readOnly ? "" : "hover:border-monitor/40 hover:bg-monitor/10"}`}
    >
      <span
        className={`${learner ? "mt-2 h-6 w-6" : "mt-1 h-3.5 w-3.5"} flex-none rounded-sm border ${
          selected ? "border-monitor bg-monitor shadow-[0_0_14px_rgba(110,247,255,0.2)]" : "border-white/25 bg-black/30"
        }`}
      />
      <span><FormattedText text={item} /></span>
    </button>
  );
}

function WorkColumns({
  columns,
  placements,
  itemResults,
  readOnly,
  audioEnabled,
  size = "standard",
  onMove
}: {
  columns: ActivityColumn[];
  placements: Record<string, string | null>;
  itemResults?: Record<string, boolean>;
  readOnly?: boolean;
  audioEnabled: boolean;
  size?: ActivityLayoutSize;
  onMove?: (item: string, column: string | null) => void;
}) {
  const learner = size === "learner";
  return (
    <div className={`grid md:grid-cols-2 ${learner ? "gap-5" : "gap-3"}`}>
      {columns.map((column) => (
        <div
          key={column.title}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const item = event.dataTransfer.getData("text/plain");
            if (item) {
              if (audioEnabled) playActivityDropCue();
              onMove?.(item, column.title);
            }
          }}
          className={`${learner ? "min-h-[280px] p-5 md:p-6" : "min-h-[170px] p-4"} rounded-md border border-white/10 bg-black/30`}
        >
          <div className={`font-display font-black uppercase tracking-[0.18em] text-monitor ${learner ? "text-base" : "text-xs"}`}>{column.title}</div>
          <div className={`${learner ? "mt-5 min-h-[190px] gap-3 p-4" : "mt-4 min-h-[105px] gap-2 p-3"} flex flex-wrap content-start rounded-md border border-dashed border-white/15 bg-white/[0.025]`}>
            {Object.entries(placements)
              .filter(([, placedColumn]) => placedColumn === column.title)
              .map(([item]) => (
                <ActivityCard
                  key={item}
                  item={item}
                  result={itemResults?.[item]}
                  readOnly={readOnly}
                  size={size}
                  onDragStart={() => undefined}
                />
              ))}
            {!Object.values(placements).includes(column.title) && (
              <div className={`grid min-h-[76px] flex-1 place-items-center px-4 text-center text-white/30 ${learner ? "text-xl" : "text-sm"}`}>
                Drop cards here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectionActivityPanel({
  activity,
  placements,
  itemResults,
  readOnly,
  audioEnabled,
  size = "standard",
  onMove
}: {
  activity: PromptActivity;
  placements: Record<string, string | null>;
  itemResults?: Record<string, boolean>;
  readOnly?: boolean;
  audioEnabled: boolean;
  size?: ActivityLayoutSize;
  onMove?: (item: string, column: string | null) => void;
}) {
  const learner = size === "learner";
  const selectedColumn = activity.columns[0]?.title ?? "Selected";
  const selectedItems = activity.itemBank.filter((item) => placements[item] === selectedColumn);

  return (
    <div className={`grid ${learner ? "mt-8 gap-6" : "mt-6 gap-4"}`}>
      <div className={`rounded-md border border-white/10 bg-white/[0.035] ${learner ? "p-5 md:p-6" : "p-4"}`}>
        <div className={`flex items-center gap-2 font-display font-black uppercase tracking-[0.18em] text-white/45 ${learner ? "mb-5 text-sm" : "mb-3 text-xs"}`}>
          <ClipboardList className={`${learner ? "h-5 w-5" : "h-4 w-4"} text-monitor`} />
          {activity.itemBankLabel}
        </div>
        <div className={`grid ${learner ? "gap-3 lg:grid-cols-2" : "gap-2 sm:grid-cols-2 xl:grid-cols-3"}`}>
          {activity.itemBank.map((item) => {
            const selected = placements[item] === selectedColumn;

            return (
              <SelectableOptionCard
                key={item}
                item={item}
                selected={selected}
                result={itemResults?.[item]}
                readOnly={readOnly}
                size={size}
                onToggle={(selectedItem) => {
                  if (audioEnabled) playActivityDropCue();
                  onMove?.(selectedItem, selected ? null : selectedColumn);
                }}
              />
            );
          })}
        </div>
      </div>

      <div className={`rounded-md border border-monitor/20 bg-monitor/10 ${learner ? "p-5 md:p-6" : "p-4"}`}>
        <div className={`font-display font-black uppercase tracking-[0.18em] text-monitor ${learner ? "text-base" : "text-xs"}`}>{selectedColumn}</div>
        <div className={`${learner ? "mt-4 min-h-[92px] gap-3 p-4" : "mt-3 min-h-[56px] gap-2 p-3"} flex flex-wrap rounded-md border border-dashed border-monitor/20 bg-black/20`}>
          {selectedItems.map((item) => (
            <ActivityCard key={item} item={item} readOnly result={itemResults?.[item]} size={size} onDragStart={() => undefined} />
          ))}
          {!selectedItems.length && (
            <div className={`grid min-h-10 flex-1 place-items-center text-white/30 ${learner ? "text-xl" : "text-sm"}`}>
              None selected
            </div>
          )}
        </div>
      </div>
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
  audioEnabled = true,
  size = "standard",
  onMoveCard,
  onCheck
}: {
  prompt: CompetencyPrompt | PlayerPrompt;
  showAnswer?: boolean;
  activityState?: ActivityState;
  readOnly?: boolean;
  audioEnabled?: boolean;
  size?: ActivityLayoutSize;
  onMoveCard?: (item: string, column: string | null) => void;
  onCheck?: () => void;
}) {
  const hostPrompt = prompt as CompetencyPrompt;
  const answerKey = showAnswer ? hostPrompt.answerKey : undefined;
  const activity = prompt.activity;

  if (!activity) return null;

  const mode = activity.mode === "select" ? "select" : "sort";
  const placements = activityState?.placements ?? Object.fromEntries(activity.itemBank.map((item) => [item, null]));
  const itemResults = activityState?.itemResults;
  const checkCount = activityState?.checkCount ?? 0;
  const correctCount = itemResults ? Object.values(itemResults).filter(Boolean).length : 0;
  const allCorrect = Boolean(itemResults) && correctCount === activity.itemBank.length;
  const visibleItemResults = showAnswer ? itemResults : undefined;
  const remainingChecks = Math.max(0, 2 - checkCount);
  const unassignedItems = mode === "sort" ? activity.itemBank.filter((item) => !placements[item]) : [];
  const learner = size === "learner";

  return (
    <motion.div
      key={prompt.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className={`grid ${learner ? "gap-6" : "gap-4"}`}
    >
      <div className={`rounded-md border border-monitor/25 bg-black/45 shadow-[0_0_38px_rgba(110,247,255,0.08)] ${learner ? "p-6 md:p-8 xl:p-10" : "p-5 md:p-6"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-sm border border-monitor/35 bg-monitor/10 font-display font-bold uppercase tracking-[0.18em] text-monitor ${learner ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs"}`}>
            Activity
          </span>
          {showAnswer ? (
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Learner screen mirror
            </span>
          ) : null}
        </div>

        <p className={`${learner ? "mt-6 max-w-6xl text-4xl font-semibold leading-[3.1rem] md:text-5xl md:leading-[4rem]" : "mt-5 text-2xl leading-9"} text-white/80`}>{activity.question || prompt.scenario}</p>

        {mode === "select" ? (
          <>
            <SelectionActivityPanel
              activity={activity}
              placements={placements}
              itemResults={visibleItemResults}
              readOnly={readOnly}
              audioEnabled={audioEnabled}
              size={size}
              onMove={onMoveCard}
            />
            <div className={`mt-5 flex items-center gap-3 text-white/45 ${learner ? "text-xl" : "text-sm"}`}>
              <MoveRight className={`${learner ? "h-6 w-6" : "h-4 w-4"} text-monitor`} />
              Select the relevant options and leave the distractors unselected.
            </div>
          </>
        ) : (
          <>
            <div className={`mt-6 rounded-md border border-white/10 bg-white/[0.035] ${learner ? "p-5 md:p-6" : "p-4"}`}>
              <div className={`flex items-center gap-2 font-display font-black uppercase tracking-[0.18em] text-white/45 ${learner ? "mb-5 text-sm" : "mb-3 text-xs"}`}>
                <ClipboardList className={`${learner ? "h-5 w-5" : "h-4 w-4"} text-monitor`} />
                {activity.itemBankLabel}
              </div>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const item = event.dataTransfer.getData("text/plain");
                  if (item) {
                    if (audioEnabled) playActivityDropCue();
                    onMoveCard?.(item, null);
                  }
                }}
                className={`${learner ? "min-h-[116px] gap-3 p-4" : "min-h-[56px] gap-2 p-3"} flex flex-wrap rounded-md border border-dashed border-white/10 bg-black/20`}
              >
                {unassignedItems.map((item) => (
                  <ActivityCard
                    key={item}
                    item={item}
                    result={visibleItemResults?.[item]}
                    readOnly={readOnly}
                    size={size}
                    onDragStart={() => undefined}
                  />
                ))}
                {!unassignedItems.length && (
                  <div className={`grid min-h-10 flex-1 place-items-center text-white/30 ${learner ? "text-xl" : "text-sm"}`}>
                    All cards placed
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-5 flex items-center gap-3 text-white/45 ${learner ? "text-xl" : "text-sm"}`}>
              <MoveRight className={`${learner ? "h-6 w-6" : "h-4 w-4"} text-monitor`} />
              Sort the cards into the correct column.
            </div>

            <div className="mt-4">
              <WorkColumns
                columns={activity.columns}
                placements={placements}
                itemResults={visibleItemResults}
                readOnly={readOnly}
                audioEnabled={audioEnabled}
                size={size}
                onMove={onMoveCard}
              />
            </div>
          </>
        )}

        {!readOnly ? (
          <div className={`mt-5 flex flex-wrap items-center justify-between rounded-md border border-white/10 bg-white/[0.035] ${learner ? "gap-5 p-5" : "gap-3 p-3"}`}>
            <div>
              <div className={`font-display font-black uppercase tracking-[0.18em] text-white/45 ${learner ? "text-sm" : "text-xs"}`}>Checks</div>
              <div className={`${learner ? "mt-2 gap-2" : "mt-1 gap-1.5"} flex`}>
                {[0, 1].map((index) => (
                  <span
                    key={index}
                    className={`${learner ? "h-3.5 w-14" : "h-2.5 w-8"} rounded-full ${index < checkCount ? "bg-monitor" : "bg-white/12"}`}
                  />
                ))}
              </div>
            </div>
            {itemResults ? (
              <div
                className={`rounded-md border text-center font-display font-black uppercase tracking-[0.16em] ${learner ? "px-7 py-4 text-4xl" : "px-5 py-3 text-2xl"} ${
                  allCorrect
                    ? "border-scrub/45 bg-scrub/10 text-scrub shadow-[0_0_28px_rgba(34,245,199,0.12)]"
                    : "border-trauma/45 bg-trauma/10 text-trauma shadow-[0_0_28px_rgba(255,48,77,0.12)]"
                }`}
              >
                {allCorrect ? "Correct" : "Incorrect"}
              </div>
            ) : (
              <div className={`text-white/45 ${learner ? "text-xl" : "text-sm"}`}>{remainingChecks} checks available</div>
            )}
            <button
              type="button"
              onClick={() => {
                if (audioEnabled) playActivityCheckCue();
                onCheck?.();
              }}
              disabled={!onCheck || remainingChecks <= 0}
              className={`inline-flex items-center gap-2 rounded-md border border-monitor/35 bg-monitor/10 font-display font-black uppercase tracking-[0.14em] text-monitor transition hover:bg-monitor/15 disabled:cursor-not-allowed disabled:opacity-35 ${learner ? "min-h-16 px-6 py-3 text-base" : "min-h-10 px-4 py-2 text-xs"}`}
            >
              <RotateCcw className={learner ? "h-5 w-5" : "h-4 w-4"} />
              Check
            </button>
          </div>
        ) : itemResults ? (
          <div className={`mt-5 rounded-md border border-white/10 bg-white/[0.035] font-display font-black uppercase tracking-[0.12em] text-white/70 ${learner ? "p-5 text-xl" : "p-3 text-sm"}`}>
            Learner check {checkCount}/2: {correctCount}/{activity.itemBank.length} correct
          </div>
        ) : null}
      </div>

      {answerKey?.length ? <AnswerKey answerKey={answerKey} /> : null}
    </motion.div>
  );
}
