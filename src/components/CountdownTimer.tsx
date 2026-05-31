import { motion } from "framer-motion";
import { TimerReset } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { playTimerTickCue, playTimerUrgentCue } from "../utils/sound";

export function CountdownTimer({ endsAt, startedAt }: { endsAt: number | null; startedAt?: number | null }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, []);

  const remaining = Math.max(0, Math.ceil(((endsAt ?? now) - now) / 1000));
  const duration = startedAt && endsAt ? endsAt - startedAt : 30000;
  const percent = useMemo(() => (endsAt ? Math.max(0, Math.min(100, ((endsAt - now) / duration) * 100)) : 0), [duration, endsAt, now]);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (!endsAt) return;
    const currentRemaining = Math.max(0, Math.ceil(((endsAt ?? now) - now) / 1000));
    if (lastTickRef.current !== currentRemaining) {
      lastTickRef.current = currentRemaining;
      if (currentRemaining > 0 && currentRemaining <= 5) {
        playTimerUrgentCue();
      } else if (currentRemaining > 0) {
        playTimerTickCue();
      }
    }
  }, [now, endsAt]);

  const urgent = remaining <= 5 && endsAt;

  return (
    <motion.div
      className={`rounded-md border border-white/10 bg-black/35 p-4 ${urgent ? "border-trauma/60" : ""}`}
      animate={{ scale: urgent ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white/70">
          <TimerReset className="h-4 w-4 text-monitor" />
          <span className="font-display text-xs uppercase tracking-[0.16em]">Timer</span>
        </div>
        <strong className={`font-display text-3xl ${urgent ? "text-trauma" : "text-white"}`}>
          {endsAt ? String(remaining).padStart(2, "0") : "--"}
        </strong>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-trauma via-amber to-scrub" initial={{ width: "100%" }} animate={{ width: `${percent}%` }} />
      </div>
    </motion.div>
  );
}
