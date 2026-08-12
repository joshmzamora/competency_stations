import { useEffect, useState } from "react";
import { stations } from "../data/stations";
import type { CompetencyPrompt } from "../types";
import {
  playActivityCheckCue,
  playActivityDropCue,
  playEvaluationCue,
  playFileClickCue,
  playQuestionAdvanceCue,
  playStationTransitionCue,
  setComponentAudioOverride
} from "../utils/sound";
import { SoloPage } from "./SoloPage";

const soloAutoTimerSeconds = 15;

type TimerSnapshot = {
  prompt: CompetencyPrompt;
  timerSeconds: number | undefined;
};

export function SoloRoute() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const snapshots: TimerSnapshot[] = [];
    setComponentAudioOverride(true);

    for (const station of stations) {
      for (const prompt of station.prompts) {
        snapshots.push({ prompt, timerSeconds: prompt.timerSeconds });

        const skipsMultiplayerAutoTimer = station.id === "stroke" && prompt.type === "activity";
        prompt.timerSeconds = skipsMultiplayerAutoTimer ? undefined : soloAutoTimerSeconds;
      }
    }

    const handleSoloClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement) || button.disabled) return;

      const label = (button.textContent ?? "").replace(/\s+/g, " ").trim().toLowerCase();

      if (label === "correct") {
        playEvaluationCue("correct");
        return;
      }
      if (label === "partial") {
        playEvaluationCue("partial");
        return;
      }
      if (label === "missed") {
        playEvaluationCue("incorrect");
        return;
      }
      if (label === "check") {
        playActivityCheckCue();
        return;
      }
      if (label === "next" || label === "previous" || label === "finish") {
        playQuestionAdvanceCue();
        return;
      }
      if (label.includes("choose next station") || label.includes("view final results")) {
        playStationTransitionCue();
        return;
      }
      if (label.includes("reveal answer") || label.includes("restart timer") || label.includes("reset run")) {
        playFileClickCue();
        return;
      }
      if (label.includes("% complete") && label.includes(" min")) {
        playStationTransitionCue();
      }
    };

    const handleSoloDrop = () => playActivityDropCue();

    document.addEventListener("click", handleSoloClick, true);
    document.addEventListener("drop", handleSoloDrop, true);
    setReady(true);

    return () => {
      document.removeEventListener("click", handleSoloClick, true);
      document.removeEventListener("drop", handleSoloDrop, true);
      setComponentAudioOverride(false);
      for (const snapshot of snapshots) {
        snapshot.prompt.timerSeconds = snapshot.timerSeconds;
      }
    };
  }, []);

  if (!ready) return null;
  return <SoloPage />;
}
