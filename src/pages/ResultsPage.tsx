import { Download, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { ResultsChart } from "../components/ResultsChart";
import type { ResultRecord } from "../types";
import { clearLocalResults, downloadFile, getLocalResults, getServerResults, resetServerResults, resultsToCsv } from "../utils/results";

export function ResultsPage() {
  const [results, setResults] = useState<ResultRecord[]>([]);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    const server = await getServerResults();
    const local = getLocalResults();
    const combined = [...server, ...local].filter((result, index, array) => array.findIndex((item) => item.id === result.id) === index);
    setResults(combined);
  }

  async function resetAll() {
    clearLocalResults();
    await resetServerResults();
    setResults([]);
  }

  const stats = useMemo(() => {
    const answered = results.reduce((sum, result) => sum + result.answered, 0);
    const correct = results.reduce((sum, result) => sum + result.correct, 0);
    const partial = results.reduce((sum, result) => sum + (result.partial ?? 0), 0);
    const missed = results.flatMap((result) => result.missedPromptIds ?? []);
    const flagged = results.flatMap((result) => result.flaggedPromptIds ?? []);
    return {
      answered,
      correct,
      partial,
      accuracy: answered ? Math.round(((correct * 100 + partial * 50) / (answered * 100)) * 100) : 0,
      missed,
      flagged
    };
  }, [results]);

  const weakest = useMemo(() => {
    const categories = results.reduce<Record<string, { answered: number; missed: number }>>((acc, result) => {
      Object.entries(result.stationBreakdown ?? {}).forEach(([category, item]) => {
        const current = acc[category] ?? { answered: 0, missed: 0 };
        current.answered += item.answered;
        current.missed += item.incorrect + item.partial;
        acc[category] = current;
      });
      return acc;
    }, {});

    return Object.entries(categories)
      .map(([category, item]) => ({ category, missRate: item.answered ? Math.round((item.missed / item.answered) * 100) : 0 }))
      .sort((a, b) => b.missRate - a.missRate)
      .slice(0, 4);
  }, [results]);

  const participantLeaderboard = useMemo(() => {
    const participants = results.reduce<Record<string, { name: string; correct: number; partial: number; incorrect: number; turns: number }>>((acc, result) => {
      (result.participantStats ?? []).forEach((participant) => {
        const key = participant.playerId || participant.name;
        const current = acc[key] ?? { name: participant.name, correct: 0, partial: 0, incorrect: 0, turns: 0 };
        current.correct += participant.correct;
        current.partial += participant.partial;
        current.incorrect += participant.incorrect;
        current.turns += participant.turns;
        acc[key] = current;
      });
      return acc;
    }, {});

    return Object.values(participants)
      .map((participant) => {
        const answered = participant.correct + participant.partial + participant.incorrect;
        return {
          ...participant,
          answered,
          accuracy: answered ? Math.round(((participant.correct * 100 + participant.partial * 50) / (answered * 100)) * 100) : 0
        };
      })
      .sort((a, b) => b.accuracy - a.accuracy || b.correct - a.correct);
  }, [results]);

  const summary = useMemo(() => {
    const fastest = results
      .filter((result) => typeof result.completionSeconds === "number")
      .sort((a, b) => (a.completionSeconds ?? 0) - (b.completionSeconds ?? 0))[0];
    return {
      totalSessions: results.length,
      totalPromptsCompleted: stats.answered,
      groupAccuracy: stats.accuracy,
      mostActiveParticipant: participantLeaderboard.slice().sort((a, b) => b.turns - a.turns)[0]?.name ?? "None",
      fastestCompletionSeconds: fastest?.completionSeconds ?? null,
      participantLeaderboard
    };
  }, [participantLeaderboard, results, stats.accuracy, stats.answered]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-amber">Results dashboard</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Local performance record</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatedButton variant="secondary" onClick={() => downloadFile("competency-results.csv", resultsToCsv(results), "text/csv")}>
            <Download className="h-4 w-4" />
            CSV
          </AnimatedButton>
          <AnimatedButton
            variant="ghost"
            onClick={() => downloadFile("competency-results.json", JSON.stringify(results, null, 2), "application/json")}
          >
            <Download className="h-4 w-4" />
            JSON
          </AnimatedButton>
          <AnimatedButton
            variant="ghost"
            onClick={() => downloadFile("competency-session-summary.json", JSON.stringify(summary, null, 2), "application/json")}
          >
            <Download className="h-4 w-4" />
            Summary
          </AnimatedButton>
          <AnimatedButton variant="danger" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </AnimatedButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Answered", stats.answered],
          ["Accuracy", `${stats.accuracy}%`],
          ["Correct", stats.correct],
          ["Partial", stats.partial],
          ["Flagged", stats.flagged.length],
          ["Most active", summary.mostActiveParticipant],
          ["Fastest", summary.fastestCompletionSeconds ? `${summary.fastestCompletionSeconds}s` : "-"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-black/35 p-5">
            <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white/45">{label}</div>
            <div className="mt-2 font-display text-4xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <ResultsChart results={results} />
        <div className="rounded-md border border-white/10 bg-black/35 p-5">
          <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Weakest categories</div>
          <div className="mt-4 grid gap-3">
            {weakest.length === 0 && <p className="text-white/45">Station performance data appears here after saved competency attempts.</p>}
            {weakest.map((item) => (
              <div key={item.category} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display font-bold text-white">{item.category}</span>
                  <span className="text-trauma">{item.missRate}% missed</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-trauma" style={{ width: `${item.missRate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-black/35 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Participant leaderboard</div>
            <p className="mt-1 text-sm text-white/45">Individual performance calculated from host correct, partial, and incorrect marks.</p>
          </div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/45">{participantLeaderboard.length} participants</div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {participantLeaderboard.length === 0 && <p className="text-white/45">Participant stats appear after a completed session.</p>}
          {participantLeaderboard.map((participant, index) => (
            <div key={participant.name} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Rank {index + 1}</div>
                  <div className="mt-1 font-display text-xl font-black uppercase text-white">{participant.name}</div>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-full border border-scrub/30 bg-scrub/10 font-display text-sm font-black text-scrub">
                  {participant.accuracy}%
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-md bg-black/25 p-2"><div className="text-[10px] uppercase text-white/35">Turns</div><div className="font-display text-lg font-black">{participant.turns}</div></div>
                <div className="rounded-md bg-black/25 p-2"><div className="text-[10px] uppercase text-white/35">Correct</div><div className="font-display text-lg font-black text-scrub">{participant.correct}</div></div>
                <div className="rounded-md bg-black/25 p-2"><div className="text-[10px] uppercase text-white/35">Partial</div><div className="font-display text-lg font-black text-amber">{participant.partial}</div></div>
                <div className="rounded-md bg-black/25 p-2"><div className="text-[10px] uppercase text-white/35">Missed</div><div className="font-display text-lg font-black text-trauma">{participant.incorrect}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-white/10 bg-black/35">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.04] font-display text-xs uppercase tracking-[0.16em] text-white/50">
            <tr>
              <th className="p-3">Mode</th>
              <th className="p-3">Room</th>
              <th className="p-3">Score</th>
              <th className="p-3">Answered</th>
              <th className="p-3">Partial</th>
              <th className="p-3">Accuracy</th>
              <th className="p-3">Flags</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-t border-white/10">
                <td className="p-3">{result.mode}</td>
                <td className="p-3">{result.roomCode ?? "-"}</td>
                <td className="p-3">{result.score}</td>
                <td className="p-3">{result.answered}</td>
                <td className="p-3">{result.partial ?? 0}</td>
                <td className="p-3">{result.accuracy}%</td>
                <td className="p-3">{(result.flaggedPromptIds ?? []).length}</td>
                <td className="p-3">{new Date(result.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
