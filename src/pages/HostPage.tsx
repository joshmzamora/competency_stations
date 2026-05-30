import {
  Check,
  ChevronLeft,
  Circle as CircleIcon,
  ClipboardList,
  Copy,
  PauseCircle,
  Play,
  Power,
  Radio,
  SkipForward,
  Square as SquareIcon,
  Star,
  Timer,
  Triangle,
  Umbrella,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { EvaluationEffect } from "../components/EvaluationEffect";
import { Modal } from "../components/Modal";
import { PromptCard } from "../components/PromptCard";
import { ProtocolIntro } from "../components/ProtocolIntro";
import { ScenarioIntro } from "../components/ScenarioIntro";
import { SelectionRoulette } from "../components/SelectionRoulette";
import { buildMissedQuestionReport, SessionDebrief } from "../components/SessionDebrief";
import { StationCard } from "../components/StationCard";
import { StationTransition } from "../components/StationTransition";
import { useAppChrome } from "../context/ChromeContext";
import { stations } from "../data/stations";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { CompetencyPrompt, CompetencyStation, EvaluationStatus, PlayerShape, PlayerState, PromptEvaluation } from "../types";
import { downloadFile } from "../utils/results";
import { playQuestionAdvanceCue, playStationTransitionCue } from "../utils/sound";

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

function HudPill({ label, value, tone = "text-white" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
      <div className="font-display text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">{label}</div>
      <div className={`mt-0.5 truncate font-display text-lg font-black uppercase ${tone}`}>{value}</div>
    </div>
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
    <div className="rounded-md border border-white/10 bg-black/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-monitor">Current station</div>
          <div className="mt-1 truncate font-display text-3xl font-black uppercase leading-none text-white">
            {station?.shortTitle ?? "Select a station"}
          </div>
          {prompt ? (
            <div className="mt-3 rounded-md border border-monitor/15 bg-monitor/10 px-3 py-2">
              <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-monitor">Question in progress</div>
              <div className="mt-1 text-sm font-semibold text-white/78">Review the scenario below and evaluate the active response.</div>
            </div>
          ) : null}
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[520px] sm:grid-cols-5">
          <HudPill label="Question" value={totalPrompts ? `${promptIndex + 1}/${totalPrompts}` : "-"} tone="text-monitor" />
          <HudPill label="Active" value={activeParticipant?.displayName ?? "Pending"} tone={activeParticipant ? shapeTone(activeParticipant.shape).text : "text-white/45"} />
          <HudPill label="Station left" value={remaining} tone="text-amber" />
          <HudPill label="Accuracy" value={`${accuracy}%`} tone="text-scrub" />
          <HudPill label="Duration" value={duration} tone="text-white" />
        </div>
      </div>
    </div>
  );
}

export function HostPage() {
  const { status, room, error, clientId, send, clearError } = useRoomSocket();
  const { setNavHidden } = useAppChrome();
  const [participantNotes, setParticipantNotes] = useState<Record<string, string>>({});
  const [effectVisible, setEffectVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [stationTransitionVisible, setStationTransitionVisible] = useState(false);
  const [introKeySeen, setIntroKeySeen] = useState("");
  const [protocolIntroSeenAt, setProtocolIntroSeenAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const stationIdRef = useRef<string>("");
  const questionKeyRef = useRef<string>("");
  const debriefRequestedRef = useRef(false);
  const downloadedDebriefRef = useRef<number | null>(null);

  const station = room?.selectedStation as CompetencyStation | null | undefined;
  const prompt = station?.prompts[room?.activePromptIndex ?? 0] as CompetencyPrompt | undefined;
  const stationId = station?.id ?? "";
  const questionKey = stationId ? `${stationId}:${room?.activePromptIndex ?? 0}` : "";
  const isStrokeStation = station?.id === "stroke";
  const totalPrompts = station?.prompts.length ?? 0;
  const evaluations = room?.evaluations ?? {};
  const evaluationList = useMemo(() => Object.values(evaluations), [evaluations]);
  const currentEvaluation = prompt ? evaluations[prompt.id] : undefined;
  const connectedParticipants = room?.players.filter((player) => player.connected).length ?? 0;
  const stationCompletedCount = station ? station.prompts.filter((item) => evaluations[item.id]).length : 0;
  const stationRemaining = Math.max(0, totalPrompts - stationCompletedCount);
  const allPromptsTotal = useMemo(() => stations.reduce((sum, item) => sum + item.prompts.length, 0), []);
  const allStationsComplete = room?.status === "in-progress" && allPromptsTotal > 0 && evaluationList.length >= allPromptsTotal;
  const connectionLabel =
    status === "open" ? "Connected" : status === "connecting" ? "Connecting" : status === "closed" ? "Disconnected" : "Connection issue";
  const preselectedStation = useMemo(() => {
    const stationId = new URLSearchParams(window.location.search).get("station");
    return stations.find((item) => item.id === stationId);
  }, []);
  const learnerUrl = `${window.location.origin}/player`;
  const introKey = room?.introStartedAt && station ? `${room.code}-${room.introStartedAt}` : "";
  const canStartSession = Boolean(station && room && room.status !== "in-progress" && connectedParticipants >= 2 && connectedParticipants <= 5);
  const launchChecklist = [
    { label: "Station", value: station?.shortTitle ?? "Choose station", ready: Boolean(station) },
    { label: "Participants", value: `${connectedParticipants}/5 connected`, ready: connectedParticipants >= 2 && connectedParticipants <= 5 },
    { label: "Intro", value: room?.status === "in-progress" ? "Already launched" : "Ready when checks pass", ready: canStartSession }
  ];
  const sessionDuration = room?.sessionStartedAt ? formatDuration(now - room.sessionStartedAt) : "0:00";
  const atFirstPrompt = (room?.activePromptIndex ?? 0) <= 0;
  const atLastPrompt = (room?.activePromptIndex ?? 0) >= totalPrompts - 1;
  const canAdvanceQuestion = room?.status !== "in-progress" || Boolean(currentEvaluation);
  const stationNavigationLocked = Boolean(station && room?.status === "in-progress" && prompt && !currentEvaluation);
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

  const downloadMissedReport = useCallback(() => {
    const report = buildMissedQuestionReport(room ?? null);
    const code = room?.code ?? "session";
    downloadFile(`competency-missed-questions-${code}.json`, report.json, "application/json");
    window.setTimeout(() => {
      downloadFile(`competency-missed-questions-${code}.csv`, report.csv, "text/csv");
    }, 250);
  }, [room]);

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
    if (!allStationsComplete || room?.debriefStartedAt || room?.closingStartedAt || debriefRequestedRef.current) return;
    debriefRequestedRef.current = true;
    send({ type: "show-debrief" });
  }, [allStationsComplete, room?.closingStartedAt, room?.debriefStartedAt, send]);

  useEffect(() => {
    if (!room?.debriefStartedAt || room.closingStartedAt || downloadedDebriefRef.current === room.debriefStartedAt) return;
    downloadedDebriefRef.current = room.debriefStartedAt;
    downloadMissedReport();
  }, [downloadMissedReport, room?.closingStartedAt, room?.debriefStartedAt]);

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

  useEffect(() => {
    if (!stationId) {
      stationIdRef.current = "";
      return;
    }

    const previousStationId = stationIdRef.current;
    stationIdRef.current = stationId;

    if (!previousStationId || previousStationId === stationId || room?.status !== "in-progress" || introVisible || protocolIntroVisible) return;

    setStationTransitionVisible(false);
    const showId = window.setTimeout(() => {
      setStationTransitionVisible(true);
      try {
        playStationTransitionCue();
      } catch {
        // Browsers can block audio until interaction.
      }
    }, 20);
    const timeout = window.setTimeout(() => setStationTransitionVisible(false), 2600);
    return () => {
      window.clearTimeout(showId);
      window.clearTimeout(timeout);
    };
  }, [introVisible, protocolIntroVisible, room?.status, stationId]);

  useEffect(() => {
    if (!questionKey || room?.status !== "in-progress") {
      questionKeyRef.current = questionKey;
      return;
    }

    const previousQuestionKey = questionKeyRef.current;
    questionKeyRef.current = questionKey;
    const previousStationId = previousQuestionKey.split(":")[0];

    if (previousQuestionKey && previousQuestionKey !== questionKey && previousStationId === stationId) {
      try {
        playQuestionAdvanceCue();
      } catch {
        // Browsers can block audio until interaction.
      }
    }
  }, [questionKey, room?.status, stationId]);

  function evaluate(statusValue: EvaluationStatus) {
    if (!prompt || (!room?.currentParticipantId && !isStrokeStation)) return;
    const playerId = isStrokeStation ? undefined : room?.currentParticipantId ?? undefined;
    send({ type: "evaluate-prompt", promptId: prompt.id, playerId, status: statusValue, flagged: false });
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

  function endSession() {
    send({ type: "end-game", promptIds: stations.flatMap((item) => item.prompts.map((stationPrompt) => stationPrompt.id)) });
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
                ["3", "Run questions"]
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
            {room.status === "lobby" && (
              <div className="rounded-md border border-scrub/20 bg-[linear-gradient(180deg,rgba(34,245,199,0.07),rgba(0,0,0,0.32))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.26)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Local room</div>
                    <div className="mt-1 font-display text-5xl font-black leading-none text-scrub">{room.code}</div>
                  </div>
                  <StatusChip label="Staging" />
                </div>

                <div className="mt-4 grid gap-2">
                  {launchChecklist.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-3 py-2">
                      <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">{item.label}</div>
                      <div className={`flex items-center gap-2 text-right text-xs font-semibold ${item.ready ? "text-scrub" : "text-amber"}`}>
                        <span className={`h-2 w-2 rounded-full ${item.ready ? "bg-scrub shadow-scrub" : "bg-amber"}`} />
                        <span>{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-md border border-monitor/20 bg-monitor/10 p-3">
                  <div className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-monitor">Learner computer URL</div>
                  <div className="mt-1 break-all text-sm text-white/75">{learnerUrl}</div>
                </div>
                <div className="mt-4 grid grid-cols-[0.85fr_1.15fr] gap-2">
                  <AnimatedButton variant="ghost" onClick={() => navigator.clipboard.writeText(room.code)}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </AnimatedButton>
                  <AnimatedButton variant="secondary" onClick={startSimulation} disabled={!canStartSession}>
                    <Play className="h-4 w-4" />
                    Start intro
                  </AnimatedButton>
                </div>
                {!station && <p className="mt-3 text-xs text-amber">Choose a station before starting.</p>}
                {station && connectedParticipants < 2 && (
                  <p className="mt-3 text-xs text-amber">The learner computer must join with 2-5 participant names before the intro can start.</p>
                )}
                {station && connectedParticipants >= 2 && (
                  <p className="mt-3 text-xs text-scrub">
                    {isStrokeStation ? "Ready. The intro plays once, then Stroke activities begin." : "Ready. The intro plays once, then participant selection begins."}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="mb-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-monitor">Station navigation</div>
              <div className="mb-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-white/55">
                Pick the first station before starting. After each station, choose the next station here; scores and results stay in one continuous session.
              </div>
              <div className="grid gap-2">
                {stations.map((item, index) => {
                  const isActive = item.id === station?.id;
                  const progress = stationProgress.get(item.id);
                  const completedStation = Boolean(progress?.done);
                  return (
                    <button
                      key={item.id}
                      disabled={stationNavigationLocked}
                      onClick={() => send({ type: "open-station", station: item })}
                      className={`rounded-md border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-scrub/50 bg-scrub/10 text-scrub"
                          : completedStation
                            ? "border-scrub/25 bg-scrub/[0.055] text-white/55"
                            : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25"
                      } ${stationNavigationLocked ? "cursor-not-allowed opacity-45" : ""}`}
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
              remaining={stationRemaining}
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
                  <AnimatedButton variant="secondary" onClick={goNext} disabled={atLastPrompt || !canAdvanceQuestion}>
                    <SkipForward className="h-4 w-4" />
                    Next Question
                  </AnimatedButton>
                </div>
                {!currentEvaluation && (
                  room.status === "in-progress" ? <div className="rounded-md border border-amber/20 bg-amber/10 p-3 text-sm text-amber">
                    Mark this question Correct, Partial, or Incorrect before moving on.
                  </div> : null
                )}
                {atLastPrompt && currentEvaluation && (
                  <div className="rounded-md border border-monitor/20 bg-monitor/10 p-3 text-sm text-monitor">
                    Station complete. Choose the next station from the station navigation list.
                  </div>
                )}
              </>
            )}
          </main>

          <aside className="grid content-start gap-4">
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
              ) : null}
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
              <AnimatedButton variant="danger" onClick={endSession}>
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
        canSkip
        onSkip={() => {
          setProtocolIntroSeenAt(room?.protocolIntroStartedAt ?? null);
          send({ type: "skip-protocol-assignment" });
          if (!isStrokeStation) send({ type: "start-selection" });
        }}
        onComplete={() => {
          setProtocolIntroSeenAt(room?.protocolIntroStartedAt ?? null);
          if (!isStrokeStation) send({ type: "start-selection" });
        }}
      />
      <StationTransition station={station ?? null} visible={stationTransitionVisible} />
      {!isStrokeStation && <SelectionRoulette selection={room?.selection ?? null} players={room?.players ?? []} clientId={clientId} />}
      <SessionDebrief
        room={room ?? null}
        role="host"
        onDownload={downloadMissedReport}
        onClosing={() => send({ type: "show-closing" })}
        onEnd={endSession}
      />
    </section>
  );
}
