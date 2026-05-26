import { Download, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatedButton } from "../components/AnimatedButton";
import { ResultsChart } from "../components/ResultsChart";
import type { ResultRecord } from "../types";
import { clearLocalResults, clearStudyProgress, downloadFile, getLocalResults, getServerResults, resetServerResults, resultsToCsv } from "../utils/results";

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
    clearStudyProgress();
    await resetServerResults();
    setResults([]);
  }

  const stats = useMemo(() => {
    const answered = results.reduce((sum, result) => sum + result.answered, 0);
    const correct = results.reduce((sum, result) => sum + result.correct, 0);
    const missed = results.flatMap((result) => result.missedQuestionIds);
    return {
      answered,
      correct,
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      missed
    };
  }, [results]);

  const weakest = useMemo(() => {
    const categories = results.reduce<Record<string, { answered: number; missed: number }>>((acc, result) => {
      Object.entries(result.categoryBreakdown ?? {}).forEach(([category, item]) => {
        const current = acc[category] ?? { answered: 0, missed: 0 };
        current.answered += item.answered;
        current.missed += item.missed;
        acc[category] = current;
      });
      return acc;
    }, {});

    return Object.entries(categories)
      .map(([category, item]) => ({ category, missRate: item.answered ? Math.round((item.missed / item.answered) * 100) : 0 }))
      .sort((a, b) => b.missRate - a.missRate)
      .slice(0, 4);
  }, [results]);

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
          ["Missed", stats.missed.length]
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
            {weakest.length === 0 && <p className="text-white/45">Quick quiz category data appears here after saved quiz attempts.</p>}
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

      <div className="mt-5 overflow-hidden rounded-md border border-white/10 bg-black/35">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.04] font-display text-xs uppercase tracking-[0.16em] text-white/50">
            <tr>
              <th className="p-3">Mode</th>
              <th className="p-3">Room</th>
              <th className="p-3">Score</th>
              <th className="p-3">Answered</th>
              <th className="p-3">Accuracy</th>
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
                <td className="p-3">{result.accuracy}%</td>
                <td className="p-3">{new Date(result.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
