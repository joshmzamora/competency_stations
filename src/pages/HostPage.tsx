import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle as CircleIcon,
  ClipboardList,
  Copy,
  Flag,
  Gauge,
  PauseCircle,
  Play,
  Power,
  Radio,
  RotateCcw,
  SkipForward,
  Square as SquareIcon,
  Star,
  Timer,
  Triangle,
  Umbrella,
  UsersRound,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { EvaluationEffect } from "../components/EvaluationEffect";
import { Modal } from "../components/Modal";
import { PromptCard } from "../components/PromptCard";
import { ProtocolIntro } from "../components/ProtocolIntro";
import { ScenarioIntro } from "../components/ScenarioIntro";
import { SelectionRoulette } from "../components/SelectionRoulette";
import { StationCard } from "../components/StationCard";
import { useAppChrome } from "../context/ChromeContext";
import { stations } from "../data/stations";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { CompetencyPrompt, CompetencyStation, EvaluationStatus, PlayerShape, PlayerState, PromptEvaluation } from "../types";

type ParticipantPerformance = PlayerState & {
  displayName: string;
  correct: number;
  partial: number;
  incorrect: number;
  evaluatedTurns: number;
  accuracy: number;
  participation: number;
};

function ShapeIcon({ shape, className }: { shape: PlayerShape; className?: string }) {
  switch (shape) {
    case "circle": return <CircleIcon className={className} />;
    case "triangle": return <Triangle className={className} />;
    case "square": return <SquareIcon className={className} />;
    case "star": return <Star className={className} />;
    case "umbrella": return <Umbrella className={className} />;
  }
}

function publicName(name?: string) {
  if (!name) return "Unassigned";
  const match = name.match(/\((.*)\)/);
  return match?.[1] || name;
}

function shapeTone(shape?: PlayerShape) {
  switch (shape) {
    case "circle": return { text: "text-scrub", border: "border-scrub/45", bg: "bg-scrub/10", ring: "shadow-[0_0_36px_rgba(34,245,199,0.22)]" };
    case "triangle": return { text: "text-trauma", border: "border-trauma/45", bg: "bg-trauma/10", ring: "shadow-[0_0_36px_rgba(255,48,77,0.22)]" };
    case "square": return { text: "text-monitor", border: "border-monitor/45", bg: "bg-monitor/10", ring: "shadow-[0_0_36px_rgba(110,247,255,0.18)]" };
    case "star": return { text: "text-amber", border: "border-amber/45", bg: "bg-amber/10", ring: "shadow-[0_0_36px_rgba(255,176,32,0.18)]" };
    case "umbrella": return { text: "text-white", border: "border-white/35", bg: "bg-white/10", ring: "shadow-[0_0_34px_rgba(255,255,255,0.12)]" };
    default: return { text: "text-white/40", border: "border-white/10", bg: "bg-white/[0.04]", ring: "" };
  }
}

function percent(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

function weightedAccuracy(correct: number, partial: number, total: number) {
  return total ? Math.round(((correct * 100 + partial * 50) / (total * 100)) * 100) : 0;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function stationRoute(startId?: string | null) {
  const startIndex = stations.findIndex((station) => station.id === startId);
  if (startIndex < 0) return stations;
  return [...stations.slice(startIndex), ...stations.slice(0, startIndex)];
}

function StatusChip({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "active" | "review" }) {
  const className =
    tone === "active"
      ? "border-scrub/35 bg-scrub/10 text-scrub"
      : tone === "review"
        ? "border-amber/35 bg-amber/10 text-amber"
        : "border-white/10 bg-white/[0.04] text-white/50";

  return <span className={`rounded-full border px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] ${className}`}>{label}</span>;
}

function StatTile({ label, value, tone = "text-white" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className={`mt-1 font-display text-2xl font-black ${tone}`}>{value}</div>
    </div>
  );
}

function TrafficLightPanel({
  value,
  onSet
}: {
  value: "red" | "green" | null;
  onSet: (value: "red" | "green" | null) => void;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/35 p-4">
      <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Red / Green Light</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onSet("red")}
          className={`rounded-md border px-3 py-3 font-display text-xs font-black uppercase tracking-[0.12em] transition ${
            value === "red" ? "border-trauma/70 bg-trauma/25 text-white shadow-alert" : "border-white/10 bg-white/[0.04] text-trauma hover:bg-trauma/10"
          }`}
        >
          Red
        </button>
        <button
          type="button"
          onClick={() => onSet("green")}
          className={`rounded-md border px-3 py-3 font-display text-xs font-black uppercase tracking-[0.12em] transition ${
            value === "green" ? "border-scrub/70 bg-scrub/25 text-white shadow-scrub" : "border-white/10 bg-white/[0.04] text-scrub hover:bg-scrub/10"
          }`}
        >
          Green
        </button>
        <button
          type="button"
          onClick={() => onSet(null)}
          className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 font-display text-xs font-black uppercase tracking-[0.12em] text-white/55 transition hover:bg-white/10"
        >
          Clear
        </button>
      </div>
      <div className={`mt-3 rounded-md border px-3 py-2 text-center font-display text-sm font-black uppercase tracking-[0.18em] ${
        value === "red"
          ? "border-trauma/45 bg-trauma/15 text-trauma"
          : value === "green"
            ? "border-scrub/45 bg-scrub/15 text-scrub"
            : "border-white/10 bg-white/[0.03] text-white/35"
      }`}>
        {value === "red" ? "Stop movement" : value === "green" ? "Proceed" : "No signal"}
      </div>
    </div>
  );
}

function ParticipantCard({
  player,
  active,
  selecting,
  disabled,
  onSelect,
  note,
  onNoteChange
}: {
  player: ParticipantPerformance;
  active: boolean;
  selecting: boolean;
  disabled: boolean;
  onSelect: () => void;
  note: string;
  onNoteChange: (value: string) => void;
}) {
  const tone = shapeTone(player.shape);
  const needsReview = player.incorrect > 0 || player.partial > player.correct;
  const status = active ? "Active" : needsReview ? "Needs Review" : player.turnCount > 0 ? "Awaiting Turn" : "Ready";

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      onClick={onSelect}
      disabled={disabled}
      className={`group grid w-full gap-3 rounded-md border p-4 text-left transition ${
        active ? `${tone.border} ${tone.bg} ${tone.ring}` : "border-white/10 bg-black/35 hover:border-white/25"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${selecting ? "animate-pulse" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`grid h-16 w-16 flex-none place-items-center rounded-md border ${tone.border} ${active ? "bg-black/40" : "bg-white/[0.04]"}`}>
            {player.shape && <ShapeIcon shape={player.shape} className={`h-10 w-10 ${tone.text}`} />}
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-black uppercase text-white">{player.displayName}</div>
            <div className={`mt-0.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] ${tone.text}`}>{player.shape ?? "shape pending"}</div>
          </div>
        </div>
        <StatusChip label={status} tone={active ? "active" : needsReview ? "review" : "neutral"} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatTile label="Turns" value={player.turnCount} />
        <StatTile label="Correct" value={player.correct} tone="text-scrub" />
        <StatTile label="Partial" value={player.partial} tone="text-amber" />
        <StatTile label="Missed" value={player.incorrect} tone="text-trauma" />
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-white/45">
          <span>Participation</span>
          <span>{player.participation}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full ${active ? "bg-scrub" : "bg-white/35"}`} style={{ width: `${player.participation}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/35 font-display text-xs font-black text-white">
          {player.accuracy}%
        </div>
        <textarea
          value={note}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onNoteChange(event.target.value)}
          className="min-h-10 resize-none rounded-md border border-white/10 bg-panel/80 px-3 py-2 text-xs text-white outline-none focus:border-scrub"
          placeholder="Quick participant note..."
        />
      </div>
    </motion.button>
  );
}

function SessionHud({
  station,
  prompt,
  promptIndex,
  totalPrompts,
  activeParticipant,
  remaining,
  accuracy,
  duration
}: {
  station?: CompetencyStation | null;
  prompt?: CompetencyPrompt;
  promptIndex: number;
  totalPrompts: number;
  activeParticipant?: ParticipantPerformance;
  remaining: number;
  accuracy: number;
  duration: string;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-white/10 bg-black/35 p-4 md:grid-cols-3 xl:grid-cols-6">
      <StatTile label="Station" value={station?.shortTitle ?? "Select"} tone="text-white" />
      <StatTile label="Prompt" value={totalPrompts ? `${promptIndex + 1}/${totalPrompts}` : "-"} tone="text-monitor" />
      <StatTile label="Active" value={activeParticipant?.displayName ?? "Pending"} tone={activeParticipant ? shapeTone(activeParticipant.shape).text : "text-white/45"} />
      <StatTile label="Remaining" value={remaining} tone="text-amber" />
      <StatTile label="Accuracy" value={`${accuracy}%`} tone="text-scrub" />
      <StatTile label="Duration" value={duration} tone="text-white" />
      {prompt && (
        <div className="md:col-span-3 xl:col-span-6 rounded-md border border-monitor/15 bg-monitor/10 px-3 py-2">
          <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-monitor">Current prompt</div>
          <div className="mt-1 truncate text-sm text-white/75">{prompt.title}</div>
        </div>
      )}
    </div>
  );
}

export function HostPage() {
  const { status, room, error, clientId, send, clearError } = useRoomSocket();
  const { setNavHidden } = useAppChrome();
  const [note, setNote] = useState("");
  const [participantNotes, setParticipantNotes] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState(false);
  const [effectVisible, setEffectVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [introKeySeen, setIntroKeySeen] = useState("");
  const [protocolIntroSeenAt, setProtocolIntroSeenAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const station = room?.selectedStation as CompetencyStation | null | undefined;
  const prompt = station?.prompts[room?.activePromptIndex ?? 0] as CompetencyPrompt | undefined;
  const isStrokeStation = station?.id === "stroke";
  const totalPrompts = station?.prompts.length ?? 0;
  const evaluations = room?.evaluations ?? {};
  const evaluationList = useMemo(() => Object.values(evaluations), [evaluations]);
  const currentEvaluation = prompt ? evaluations[prompt.id] : undefined;
  const connectedParticipants = room?.players.filter((player) => player.connected).length ?? 0;
  const stationCompletedCount = station ? station.prompts.filter((item) => evaluations[item.id]).length : 0;
  const remaining = Math.max(0, totalPrompts - stationCompletedCount);
  const connectionLabel =
    status === "open" ? "Connected" : status === "connecting" ? "Connecting" : status === "closed" ? "Disconnected" : "Connection issue";
  const preselectedStation = useMemo(() => {
    const stationId = new URLSearchParams(window.location.search).get("station");
    return stations.find((item) => item.id === stationId);
  }, []);
  const learnerUrl = `${window.location.origin}/player`;
  const introKey = room?.introStartedAt && station ? `${room.code}-${room.introStartedAt}` : "";
  const canStartSession = Boolean(station && room && room.status !== "in-progress" && connectedParticipants >= 2 && connectedParticipants <= 5);
  const sessionDuration = room?.sessionStartedAt ? formatDuration(now - room.sessionStartedAt) : "0:00";
  const orderedStations = useMemo(() => stationRoute(room?.stationRouteStartId ?? station?.id), [room?.stationRouteStartId, station?.id]);
  const atFirstPrompt = (room?.activePromptIndex ?? 0) <= 0;
  const atLastPrompt = (room?.activePromptIndex ?? 0) >= totalPrompts - 1;
  const stationProgress = useMemo(() => {
    return new Map(
      stations.map((item) => {
        const completedPrompts = item.prompts.filter((stationPrompt) => evaluations[stationPrompt.id]).length;
        return [
          item.id,
          {
            completed: completedPrompts,
            total: item.prompts.length,
            done: item.prompts.length > 0 && completedPrompts >= item.prompts.length
          }
        ];
      })
    );
  }, [evaluations]);

  const groupStats = useMemo(() => {
    const correct = evaluationList.filter((item) => item.status === "correct").length;
    const partial = evaluationList.filter((item) => item.status === "partial").length;
    const incorrect = evaluationList.filter((item) => item.status === "incorrect").length;
    return {
      correct,
      partial,
      incorrect,
      answered: evaluationList.length,
      accuracy: weightedAccuracy(correct, partial, evaluationList.length)
    };
  }, [evaluationList]);

  const participantStats = useMemo<ParticipantPerformance[]>(() => {
    const totalTurns = Math.max(1, (room?.players ?? []).reduce((sum, player) => sum + player.turnCount, 0));
    return (room?.players ?? []).map((player) => {
      const playerEvaluations = evaluationList.filter((item: PromptEvaluation) => item.playerId === player.id);
      const correct = playerEvaluations.filter((item) => item.status === "correct").length;
      const partial = playerEvaluations.filter((item) => item.status === "partial").length;
      const incorrect = playerEvaluations.filter((item) => item.status === "incorrect").length;
      const evaluatedTurns = playerEvaluations.length;
      return {
        ...player,
        displayName: publicName(player.name),
        correct,
        partial,
        incorrect,
        evaluatedTurns,
        accuracy: weightedAccuracy(correct, partial, evaluatedTurns),
        participation: percent(player.turnCount, totalTurns)
      };
    });
  }, [evaluationList, room?.players]);

  const activeParticipant = participantStats.find((player) => player.id === room?.currentParticipantId);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (room && !station && preselectedStation) {
      send({ type: "open-station", station: preselectedStation });
    }
  }, [preselectedStation, room, send, station]);

  useEffect(() => {
    if (!currentEvaluation?.evaluatedAt) return;
    setEffectVisible(true);
    const timeout = window.setTimeout(() => setEffectVisible(false), 1300);
    return () => window.clearTimeout(timeout);
  }, [currentEvaluation?.evaluatedAt]);

  useEffect(() => {
    if (!introKey || introKeySeen === introKey) return;
    setIntroVisible(true);
  }, [introKey, introKeySeen]);

  useEffect(() => {
    setNavHidden(introVisible);
    return () => setNavHidden(false);
  }, [introVisible, setNavHidden]);

  useEffect(() => {
    if (room?.introStartedAt) return;
    setIntroVisible(false);
  }, [room?.introStartedAt]);

  const closeIntro = useCallback(() => {
    setIntroKeySeen(introKey);
    setIntroVisible(false);
    if (!isStrokeStation) send({ type: "start-protocol-assignment" });
  }, [introKey, isStrokeStation, send]);

  const skipIntro = useCallback(() => {
    send({ type: "skip-intro" });
    setIntroKeySeen(introKey);
    setIntroVisible(false);
    setProtocolIntroSeenAt(null);
    if (!isStrokeStation) send({ type: "start-protocol-assignment" });
  }, [introKey, isStrokeStation, send]);

  const protocolIntroVisible = Boolean(
    room?.protocolIntroStartedAt &&
    room.protocolIntroStartedAt !== protocolIntroSeenAt &&
    !introVisible &&
    !room.introStartedAt
  );

  function evaluate(statusValue: EvaluationStatus) {
    if (!prompt || (!room?.currentParticipantId && !isStrokeStation)) return;
    const playerId = isStrokeStation ? undefined : room?.currentParticipantId ?? undefined;
    send({ type: "evaluate-prompt", promptId: prompt.id, playerId, status: statusValue, note, flagged });
    setNote("");
    setFlagged(false);
  }

  function startSimulation() {
    if (!station || !canStartSession) return;
    send({ type: "start-session" });
  }

  function goNext() {
    if (!station || !room) return;
    if (!atLastPrompt) send({ type: "next-prompt" });
  }

  function goPrevious() {
    if (!station || !room) return;
    if (!atFirstPrompt) send({ type: "previous-prompt" });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px]">
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-monitor">Evaluator control room</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Competency Session</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="font-display text-[10px] uppercase tracking-[0.18em] text-white/45">Host connection</div>
            <div className={`font-display text-xl font-bold uppercase ${status === "open" ? "text-scrub" : "text-amber"}`}>{connectionLabel}</div>
          </div>
        </div>
      </div>

      {!room ? (
        <div className="grid gap-5 rounded-md border border-white/10 bg-black/35 p-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-[0.08em] text-white">Start a local simulation room</h2>
            <p className="mt-3 max-w-2xl text-white/65">
              Create the room, have the learner computer join with 2-5 participant names, select a station, then start the simulation intro.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["1", "Create room"],
                ["2", "Learner joins"],
                ["3", "Run prompts"]
              ].map(([step, label]) => (
                <div key={step} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-scrub">Step {step}</div>
                  <div className="mt-1 font-display text-sm font-bold uppercase text-white">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <AnimatedButton className="min-h-16 text-base" onClick={() => send({ type: "create-room" })} disabled={status !== "open"}>
            <Radio className="h-4 w-4" />
            Create room
          </AnimatedButton>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[330px_1fr_380px]">
          <aside className="grid content-start gap-4">
            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="font-display text-xs uppercase tracking-[0.2em] text-white/45">Room code</div>
              <div className="font-display text-5xl font-black text-scrub">{room.code}</div>
              <div className="mt-3 rounded-md border border-monitor/20 bg-monitor/10 p-3">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-monitor">Learner URL</div>
                <div className="mt-1 break-all text-sm text-white/75">{learnerUrl}</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <AnimatedButton variant="ghost" onClick={() => navigator.clipboard.writeText(room.code)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </AnimatedButton>
                <AnimatedButton variant="secondary" onClick={startSimulation} disabled={!canStartSession}>
                  <Play className="h-4 w-4" />
                  {room.status === "in-progress" ? "Live" : "Start"}
                </AnimatedButton>
              </div>
              {!station && <p className="mt-3 text-xs text-amber">Choose a station before starting.</p>}
              {station && connectedParticipants < 2 && (
                <p className="mt-3 text-xs text-amber">The learner computer must join with 2-5 participant names before the intro can start.</p>
              )}
              {station && connectedParticipants >= 2 && room.status !== "in-progress" && (
                <p className="mt-3 text-xs text-scrub">
                  {isStrokeStation ? "Ready. The intro plays once, then Stroke activities begin." : "Ready. The intro plays once, then participant selection begins."}
                </p>
              )}
            </div>

            <div className="rounded-md border border-trauma/20 bg-black/35 p-4">
              <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-trauma">Session setup</div>
              <div className="mt-3 grid gap-2">
                {!isStrokeStation && (
                  <AnimatedButton variant="ghost" onClick={() => send({ type: "start-protocol-assignment" })} disabled={room.status !== "in-progress"}>
                    <UsersRound className="h-4 w-4" />
                    Show assignments
                  </AnimatedButton>
                )}
              </div>
              <div className="mt-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-white/50">
                {isStrokeStation
                  ? "Stroke runs as a guided group activity. The learner screen mirrors here while the answer key stays host-only."
                  : "Selection stays balanced behind the scenes. Participant cards show engagement without revealing who is mathematically due next."}
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="mb-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Station navigation</div>
              <div className="mb-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-white/55">
                Pick the first station before starting. After each station, choose the next station here; scores and results stay in one continuous session.
              </div>
              <div className="grid gap-2">
                {orderedStations.map((item, index) => {
                  const isActive = item.id === station?.id;
                  const progress = stationProgress.get(item.id);
                  const completedStation = Boolean(progress?.done);
                  return (
                    <button
                      key={item.id}
                      onClick={() => send({ type: "open-station", station: item })}
                      className={`rounded-md border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-scrub/50 bg-scrub/10 text-scrub"
                          : completedStation
                            ? "border-scrub/25 bg-scrub/[0.055] text-white/55"
                            : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-display text-sm font-bold uppercase tracking-[0.12em]">{index + 1}. {item.shortTitle}</div>
                        {completedStation ? (
                          <span className="rounded-full border border-scrub/35 bg-scrub/10 px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-[0.12em] text-scrub">
                            Complete
                          </span>
                        ) : isActive ? (
                          <span className="rounded-full border border-monitor/35 bg-monitor/10 px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-[0.12em] text-monitor">
                            Live
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${completedStation ? "bg-scrub" : isActive ? "bg-monitor" : "bg-white/35"}`}
                            style={{ width: `${progress?.total ? Math.round((progress.completed / progress.total) * 100) : 0}%` }}
                          />
                        </div>
                        <div className="font-display text-[10px] font-black text-white/45">{progress?.completed ?? 0}/{progress?.total ?? item.prompts.length}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="grid content-start gap-4">
            <SessionHud
              station={station}
              prompt={prompt}
              promptIndex={room.activePromptIndex ?? 0}
              totalPrompts={totalPrompts}
              activeParticipant={activeParticipant}
              remaining={remaining}
              accuracy={groupStats.accuracy}
              duration={sessionDuration}
            />

            {!station ? (
              <div className="grid gap-4 md:grid-cols-2">
                {stations.map((item) => (
                  <StationCard key={item.id} station={item} onSelect={(nextStation) => send({ type: "open-station", station: nextStation })} />
                ))}
              </div>
            ) : (
              <>
                <PromptCard prompt={prompt ?? null} showAnswer activityState={prompt ? room.activityStates?.[prompt.id] : undefined} />

                <div className="grid gap-2 md:grid-cols-2">
                  <AnimatedButton variant="ghost" onClick={goPrevious} disabled={atFirstPrompt}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </AnimatedButton>
                  <AnimatedButton variant="secondary" onClick={goNext} disabled={atLastPrompt}>
                    <SkipForward className="h-4 w-4" />
                    Skip / Next Prompt
                  </AnimatedButton>
                </div>
                {atLastPrompt && (
                  <div className="rounded-md border border-monitor/20 bg-monitor/10 p-3 text-sm text-monitor">
                    Station complete. Choose the next station from the station navigation list.
                  </div>
                )}
              </>
            )}
          </main>

          <aside className="grid content-start gap-4">
            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Group performance</div>
                <Gauge className="h-4 w-4 text-monitor" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatTile label="Completed" value={groupStats.answered} />
                <StatTile label="Accuracy" value={`${groupStats.accuracy}%`} tone="text-scrub" />
                <StatTile label="Correct" value={groupStats.correct} tone="text-scrub" />
                <StatTile label="Partial" value={groupStats.partial} tone="text-amber" />
                <StatTile label="Incorrect" value={groupStats.incorrect} tone="text-trauma" />
                <StatTile label="Remaining" value={remaining} tone="text-white" />
              </div>
            </div>

            <CountdownTimer endsAt={room.timerEndsAt} />
            <div className="grid grid-cols-2 gap-2">
              <AnimatedButton variant="secondary" onClick={() => send({ type: "start-timer", seconds: prompt?.timerSeconds ?? 60 })} disabled={!prompt}>
                <Timer className="h-4 w-4" />
                Timer
              </AnimatedButton>
              <AnimatedButton variant="ghost" onClick={() => send({ type: "reset-timer" })}>
                <PauseCircle className="h-4 w-4" />
                Reset
              </AnimatedButton>
            </div>

            {station?.id === "hemodynamics" && (
              <TrafficLightPanel value={room.trafficLight} onSet={(light) => send({ type: "set-traffic-light", light })} />
            )}

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Evaluation</div>
                <ClipboardList className="h-4 w-4 text-monitor" />
              </div>
              {activeParticipant ? (
                <div className={`mb-3 rounded-md border p-3 ${shapeTone(activeParticipant.shape).border} ${shapeTone(activeParticipant.shape).bg}`}>
                  <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Evaluating</div>
                  <div className="mt-1 font-display text-xl font-black uppercase text-white">{activeParticipant.displayName}</div>
                </div>
              ) : isStrokeStation ? (
                <div className="mb-3 rounded-md border border-monitor/25 bg-monitor/10 p-3 text-xs leading-5 text-monitor">
                  Stroke is scored as a group activity. No random participant selection is required.
                </div>
              ) : (
                <div className="mb-3 rounded-md border border-amber/25 bg-amber/10 p-3 text-xs leading-5 text-amber">
                  Select a participant before marking this prompt.
                </div>
              )}
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-24 w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-white outline-none focus:border-scrub"
                placeholder="Optional evaluator note..."
              />
              <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
                <input checked={flagged} onChange={(event) => setFlagged(event.target.checked)} type="checkbox" className="h-4 w-4 accent-red-500" />
                <Flag className="h-4 w-4 text-amber" />
                Flag prompt for review
              </label>
              <div className="mt-3 grid gap-2">
                <AnimatedButton variant="secondary" onClick={() => evaluate("correct")} disabled={!prompt || (!activeParticipant && !isStrokeStation)}>
                  <Check className="h-4 w-4" />
                  Correct
                </AnimatedButton>
                <AnimatedButton variant="ghost" onClick={() => evaluate("partial")} disabled={!prompt || (!activeParticipant && !isStrokeStation)}>
                  Partial
                </AnimatedButton>
                <AnimatedButton variant="danger" onClick={() => evaluate("incorrect")} disabled={!prompt || (!activeParticipant && !isStrokeStation)}>
                  <X className="h-4 w-4" />
                  Incorrect
                </AnimatedButton>
              </div>
            </div>

            <div className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
              {!isStrokeStation && (
                <AnimatedButton
                  variant="ghost"
                  className="min-h-9 py-1 text-[10px] opacity-70 hover:opacity-100"
                  onClick={() => send({ type: "start-selection" })}
                  disabled={!prompt || room.status !== "in-progress"}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Re-run selection
                </AnimatedButton>
              )}
              <AnimatedButton variant="danger" onClick={() => send({ type: "end-game" })}>
                <Power className="h-4 w-4" />
                End session
              </AnimatedButton>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-monitor">Participants</div>
                <h3 className="font-display text-2xl font-black uppercase text-white">Turn balance and individual performance</h3>
              </div>
              <StatusChip label={`${participantStats.length} assigned`} />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {participantStats.length === 0 && (
                <div className="rounded-md border border-white/10 bg-black/35 p-5 text-white/55">No participants connected yet.</div>
              )}
              {participantStats.map((player) => (
                <ParticipantCard
                  key={player.id}
                  player={player}
                  active={player.id === room.currentParticipantId}
                  selecting={room.selection?.playerId === player.id}
                  disabled={room.status !== "in-progress" || isStrokeStation}
                  onSelect={() => send({ type: "override-selection", playerId: player.id })}
                  note={participantNotes[player.id] ?? ""}
                  onNoteChange={(value) => setParticipantNotes((current) => ({ ...current, [player.id]: value }))}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal open={Boolean(error)} title="Connection alert" onClose={clearError}>
        <p className="text-white/75">{error}</p>
      </Modal>
      <EvaluationEffect status={currentEvaluation?.status} visible={effectVisible} subtle />
      <ScenarioIntro
        open={introVisible}
        role="host"
        startedAt={room?.introStartedAt}
        serverTime={room?.serverTime}
        canSkip
        onClose={closeIntro}
        onSkip={skipIntro}
      />
      <ProtocolIntro
        open={protocolIntroVisible}
        startedAt={room?.protocolIntroStartedAt ?? null}
        players={room?.players ?? []}
        onComplete={() => {
          setProtocolIntroSeenAt(room?.protocolIntroStartedAt ?? null);
          if (!isStrokeStation) send({ type: "start-selection" });
        }}
      />
      {!isStrokeStation && <SelectionRoulette selection={room?.selection ?? null} players={room?.players ?? []} clientId={clientId} />}
    </section>
  );
}
