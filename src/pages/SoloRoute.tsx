import { useEffect, useState } from "react";
import { stations } from "../data/stations";
import type { CompetencyPrompt } from "../types";
import { setAudioMuted } from "../utils/sound";
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
    setAudioMuted(true);

    for (const station of stations) {
      for (const prompt of station.prompts) {
        snapshots.push({ prompt, timerSeconds: prompt.timerSeconds });

        const skipsMultiplayerAutoTimer = station.id === "stroke" && prompt.type === "activity";
        prompt.timerSeconds = skipsMultiplayerAutoTimer ? undefined : soloAutoTimerSeconds;
      }
    }

    setReady(true);

    return () => {
      setAudioMuted(false);
      for (const snapshot of snapshots) {
        snapshot.prompt.timerSeconds = snapshot.timerSeconds;
      }
    };
  }, []);

  if (!ready) return null;
  return <SoloPage />;
}
