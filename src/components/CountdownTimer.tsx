import { motion } from "framer-motion";
import { TimerReset } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { playTimerTickCue, playTimerUrgentCue } from "../utils/sound";

export function CountdownTimer({
  endsAt,
  startedAt,
  serverTime,
  audioEnabled = true
}: {
  endsAt: number | null;
  startedAt?: number | null;
  serverTime?: number;
  audioEnabled?: boolean;
}) {
  const [localNow, setLocalNow] = useState(Date.now());
  const localServerOffsetRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!endsAt) {
      setLocalNow(Date.now());
      return;
    }
    const interval = window.setInterval(() => setLocalNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    localServerOffsetRef.current = serverTime ? Date.now() - serverTime : 0;
  }, [serverTime]);

  useEffect(() => {
    if (!endsAt) {
      lastTickRef.current = null;
      return;
    }
    const currentServerNow = Date.now() - localServerOffsetRef.current;
    lastTickRef.current = Math.max(0, Math.ceil((endsAt - currentServerNow) / 1000));
  }, [endsAt]);

  const syncedNow = localNow - localServerOffsetRef.current;
  const remaining = Math.max(0, Math.ceil(((endsAt ?? syncedNow) - syncedNow) / 1000));
  const duration = startedAt && endsAt ? endsAt - startedAt : 30000;
  const percent = useMemo(() => (endsAt ? Math.max(0, Math.min(100, ((endsAt - syncedNow) / duration) * 100)) : 0), [duration, endsAt, syncedNow]);

  useEffect(() => {
    if (!endsAt) return;
    const currentRemaining = Math.max(0, Math.ceil((endsAt - syncedNow) / 1000));
    if (lastTickRef.current !== currentRemaining) {
      lastTickRef.current = currentRemaining;
      if (!audioEnabled) return;
      if (currentRemaining > 0 && currentRemaining <= 5) {
        playTimerUrgentCue();
      } else if (currentRemaining > 0) {
        playTimerTickCue();
      }
    }
  }, [audioEnabled, endsAt, syncedNow]);

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
