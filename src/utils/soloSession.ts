import type { CompetencyPrompt, CompetencyStation, EvaluationStatus } from "../types";

export type SoloStationResult = {
  stationId: string;
  grades: Record<string, EvaluationStatus>;
  completed: number;
  correct: number;
  partial: number;
  incorrect: number;
  score: number;
  promptCount: number;
};

export type SoloSessionResults = Record<string, SoloStationResult>;

export type SoloRunSummary = {
  completedStations: number;
  totalCorrect: number;
  totalPartial: number;
  totalIncorrect: number;
  totalCompletedPrompts: number;
  overallScore: number;
};

export const soloAutoTimerSeconds = 15;

export function getSoloTimerSeconds(stationId: string, prompt?: CompetencyPrompt | null) {
  if (!prompt) return undefined;
  return stationId === "stroke" && prompt.type === "activity" ? undefined : soloAutoTimerSeconds;
}

export function summarizeSoloStation(
  station: CompetencyStation,
  grades: Record<string, EvaluationStatus>
): SoloStationResult {
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

export function summarizeSoloRun(results: SoloSessionResults): SoloRunSummary {
  const resultList = Object.values(results);
  const totalCorrect = resultList.reduce((sum, result) => sum + result.correct, 0);
  const totalPartial = resultList.reduce((sum, result) => sum + result.partial, 0);
  const totalIncorrect = resultList.reduce((sum, result) => sum + result.incorrect, 0);
  const totalCompletedPrompts = resultList.reduce((sum, result) => sum + result.completed, 0);

  return {
    completedStations: resultList.length,
    totalCorrect,
    totalPartial,
    totalIncorrect,
    totalCompletedPrompts,
    overallScore: totalCompletedPrompts
      ? Math.round(((totalCorrect + totalPartial * 0.5) / totalCompletedPrompts) * 100)
      : 0
  };
}

export function isSoloStationLocked(results: SoloSessionResults, stationId: string) {
  return Boolean(results[stationId]);
}
