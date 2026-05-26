import type { Question, ResultRecord } from "../types";

const localResultsKey = "competency-stations-local-results";
const studyProgressKey = "competency-stations-study-progress";

export type StudyProgress = {
  gotIt: string[];
  missed: string[];
  review: string[];
};

export function getStudyProgress(): StudyProgress {
  const fallback: StudyProgress = { gotIt: [], missed: [], review: [] };
  try {
    const saved = localStorage.getItem(studyProgressKey);
    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
  } catch {
    return fallback;
  }
}

export function saveStudyProgress(progress: StudyProgress) {
  localStorage.setItem(studyProgressKey, JSON.stringify(progress));
}

export function clearStudyProgress() {
  localStorage.removeItem(studyProgressKey);
}

export function getLocalResults(): ResultRecord[] {
  try {
    return JSON.parse(localStorage.getItem(localResultsKey) ?? "[]") as ResultRecord[];
  } catch {
    return [];
  }
}

export function saveLocalResult(result: ResultRecord) {
  const results = getLocalResults();
  results.push(result);
  localStorage.setItem(localResultsKey, JSON.stringify(results));
}

export function clearLocalResults() {
  localStorage.removeItem(localResultsKey);
}

export async function getServerResults(): Promise<ResultRecord[]> {
  try {
    const response = await fetch("/api/results");
    if (!response.ok) return [];
    return (await response.json()) as ResultRecord[];
  } catch {
    return [];
  }
}

export async function saveServerResult(result: ResultRecord) {
  try {
    await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    });
  } catch {
    saveLocalResult(result);
  }
}

export async function resetServerResults() {
  try {
    await fetch("/api/results/reset", { method: "POST" });
  } catch {
    // Local-only mode can still reset localStorage.
  }
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function resultsToCsv(results: ResultRecord[]) {
  const rows = [
    ["id", "mode", "roomCode", "createdAt", "endedAt", "score", "answered", "correct", "incorrect", "accuracy", "missedQuestionIds"],
    ...results.map((result) => [
      result.id,
      result.mode,
      result.roomCode ?? "",
      result.createdAt,
      result.endedAt ?? "",
      String(result.score),
      String(result.answered),
      String(result.correct),
      String(result.incorrect),
      String(result.accuracy),
      result.missedQuestionIds.join("|")
    ])
  ];

  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function buildCategoryBreakdown(attempts: Array<{ question: Question; correct: boolean }>) {
  return attempts.reduce<Record<string, { answered: number; correct: number; missed: number }>>((acc, attempt) => {
    const item = acc[attempt.question.category] ?? { answered: 0, correct: 0, missed: 0 };
    item.answered += 1;
    if (attempt.correct) item.correct += 1;
    else item.missed += 1;
    acc[attempt.question.category] = item;
    return acc;
  }, {});
}
