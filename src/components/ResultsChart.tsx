import type { ResultRecord } from "../types";

export function ResultsChart({ results }: { results: ResultRecord[] }) {
  const last = results.slice(-8);
  const maxScore = Math.max(100, ...last.map((result) => Math.abs(result.score)));

  return (
    <div className="rounded-md border border-white/10 bg-black/35 p-5">
      <div className="mb-5 font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Score history</div>
      <div className="flex h-48 items-end gap-3">
        {last.length === 0 && <div className="m-auto text-white/45">No saved results yet.</div>}
        {last.map((result) => {
          const height = Math.max(8, (Math.abs(result.score) / maxScore) * 100);
          return (
            <div key={result.id} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end rounded-sm bg-white/[0.03]">
                <div
                  className={`w-full rounded-sm ${result.score >= 0 ? "bg-scrub" : "bg-trauma"}`}
                  style={{ height: `${height}%` }}
                  title={`${result.score} points`}
                />
              </div>
              <span className="font-display text-xs text-white/55">{result.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
