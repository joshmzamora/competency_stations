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
      <div className="grid min-h-[340px] place-items-center rounded-md border border-white/10 bg-black/35 p-10 text-center">
        <div>
          <div className="font-display text-base uppercase tracking-[0.2em] text-monitor">Simulation monitor idle</div>
          <p className="mt-3 text-lg text-white/60">Select a station and begin the guided competency flow.</p>
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
      className={`rounded-md border bg-black/45 p-8 shadow-scrub ${playerMode ? "border-monitor/35" : "border-scrub/35"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-sm border border-scrub/40 bg-scrub/10 px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-scrub">
          {prompt.type.replace(/-/g, " ")}
        </span>
      </div>
      <p className="mt-6 text-3xl leading-[2.8rem] text-white/86">{prompt.scenario}</p>

      <div className="mt-7 rounded-md border border-monitor/25 bg-monitor/10 p-5">
        <div className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">
          <ListChecks className="h-5 w-5" />
          Question details
        </div>
        <ol className="grid gap-3 text-lg leading-7 text-white/78">
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
          <div className="rounded-md border border-trauma/30 bg-trauma/10 p-5">
            <div className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-trauma">
              <CheckCircle2 className="h-5 w-5" />
              Expected response
            </div>
            <p className="text-lg leading-8 text-white/84">{hostPrompt.expectedResponse}</p>
            {hostPrompt.explanation ? <p className="mt-3 text-base leading-7 text-white/62">{hostPrompt.explanation}</p> : null}
          </div>

          {hostPrompt.notifyProviderWhen?.length ? (
            <div className="rounded-md border border-amber/30 bg-amber/10 p-5">
              <div className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-amber">
                <AlertTriangle className="h-5 w-5" />
                Notify provider when
              </div>
              <ul className="grid gap-2 text-base leading-7 text-white/72">
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
