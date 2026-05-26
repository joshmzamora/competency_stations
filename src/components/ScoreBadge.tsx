import { Activity } from "lucide-react";

export function ScoreBadge({ score, label = "Score" }: { score: number; label?: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-md border border-trauma/40 bg-trauma/10 px-4 py-3 shadow-alert">
      <Activity className="h-5 w-5 text-trauma" />
      <div>
        <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{label}</div>
        <div className="font-display text-3xl font-bold text-white">{score}</div>
      </div>
    </div>
  );
}
