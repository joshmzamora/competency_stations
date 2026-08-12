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
  playTimerTickCue,
  playTimerUrgentCue
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

    let lastTimerValue: number | null = null;
    const timerSoundInterval = window.setInterval(() => {
      const timerLabel = Array.from(document.querySelectorAll("span")).find(
        (element) => element.textContent?.trim().toLowerCase() === "timer"
      );
      const timerCard = timerLabel?.closest(".rounded-md");
      const value = timerCard?.querySelector("strong")?.textContent?.trim();
      const remaining = value ? Number.parseInt(value, 10) : Number.NaN;

      if (!Number.isFinite(remaining)) {
        lastTimerValue = null;
        return;
      }
      if (lastTimerValue === null) {
        lastTimerValue = remaining;
        return;
      }
      if (remaining === lastTimerValue) return;

      lastTimerValue = remaining;
      if (remaining <= 0) return;
      if (remaining <= 5) playTimerUrgentCue();
      else playTimerTickCue();
    }, 250);

    document.addEventListener("click", handleSoloClick, true);
    document.addEventListener("drop", handleSoloDrop, true);
    setReady(true);

    return () => {
      document.removeEventListener("click", handleSoloClick, true);
      document.removeEventListener("drop", handleSoloDrop, true);
      window.clearInterval(timerSoundInterval);
      for (const snapshot of snapshots) {
        snapshot.prompt.timerSeconds = snapshot.timerSeconds;
      }
    };
  }, []);

  if (!ready) return null;
  return <SoloPage />;
}
