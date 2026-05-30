import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import type { ActivityState, CompetencyPrompt, PlayerPrompt } from "../types";
import { ActivityPromptLayout } from "./ActivityPromptLayout";

export function PromptCard({
  prompt,
  showAnswer = false,
  playerMode = false,
  activityState
}: {
  prompt: CompetencyPrompt | PlayerPrompt | null;
  showAnswer?: boolean;
  playerMode?: boolean;
  activityState?: ActivityState;
}) {
  if (!prompt) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-md border border-white/10 bg-black/35 p-8 text-center">
        <div>
          <div className="font-display text-sm uppercase tracking-[0.2em] text-monitor">Simulation monitor idle</div>
          <p className="mt-3 text-white/60">Select a station and begin the guided competency flow.</p>
        </div>
      </div>
    );
  }

  const hostPrompt = prompt as CompetencyPrompt;

  if (prompt.type === "activity") {
    return <ActivityPromptLayout prompt={prompt} showAnswer={showAnswer} activityState={activityState} readOnly />;
  }

  return (
    <motion.article
      key={prompt.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className={`rounded-md border bg-black/45 p-6 shadow-scrub ${playerMode ? "border-monitor/35" : "border-scrub/35"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-sm border border-scrub/40 bg-scrub/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] text-scrub">
          {prompt.type.replace(/-/g, " ")}
        </span>
      </div>
      <p className="mt-5 text-2xl leading-9 text-white/82">{prompt.scenario}</p>

      <div className="mt-6 rounded-md border border-monitor/25 bg-monitor/10 p-4">
        <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-monitor">
          <ListChecks className="h-4 w-4" />
          Question details
        </div>
        <ol className="grid gap-2 text-white/78">
          {prompt.instructions.map((item, index) => (
            <li key={item} className="grid grid-cols-[2rem_1fr] gap-2">
              <span className="font-display text-scrub">{String(index + 1).padStart(2, "0")}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {showAnswer && "expectedResponse" in hostPrompt && (
        <div className="mt-6 grid gap-4">
          <div className="rounded-md border border-trauma/30 bg-trauma/10 p-4">
            <div className="mb-2 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-trauma">
              <CheckCircle2 className="h-4 w-4" />
              Expected response
            </div>
            <p className="text-white/82">{hostPrompt.expectedResponse}</p>
            <p className="mt-3 text-sm leading-6 text-white/62">{hostPrompt.explanation}</p>
          </div>

          {hostPrompt.notifyProviderWhen?.length ? (
            <div className="rounded-md border border-amber/30 bg-amber/10 p-4">
              <div className="mb-2 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-amber">
                <AlertTriangle className="h-4 w-4" />
                Notify provider when
              </div>
              <ul className="grid gap-1 text-sm text-white/72">
                {hostPrompt.notifyProviderWhen.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </motion.article>
  );
}
