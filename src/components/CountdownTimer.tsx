import { TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function CountdownTimer({ endsAt }: { endsAt: number | null }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, []);

  const remaining = Math.max(0, Math.ceil(((endsAt ?? now) - now) / 1000));
  const percent = useMemo(() => (endsAt ? Math.max(0, Math.min(100, (remaining / 30) * 100)) : 0), [endsAt, remaining]);

  return (
    <div className="rounded-md border border-white/10 bg-black/35 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white/70">
          <TimerReset className="h-4 w-4 text-monitor" />
          <span className="font-display text-xs uppercase tracking-[0.16em]">Timer</span>
        </div>
        <strong className={`font-display text-3xl ${remaining <= 5 && endsAt ? "text-trauma" : "text-white"}`}>
          {endsAt ? remaining : "--"}
        </strong>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-trauma via-amber to-scrub transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
