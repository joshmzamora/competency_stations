import {
  Check,
  ChevronLeft,
  Circle as CircleIcon,
  ClipboardList,
  Copy,
  Diamond,
  Hexagon,
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
import { useNavigate } from "react-router-dom";
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
import { StationCompleteOverlay } from "../components/StationCompleteOverlay";
import { StationTransition } from "../components/StationTransition";
import { useAppChrome } from "../context/ChromeContext";
import { stations } from "../data/stations";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { CompetencyPrompt, CompetencyStation, EvaluationStatus, PlayerShape, PlayerState, PromptEvaluation, RoomState } from "../types";
import { downloadFile } from "../utils/results";
import { isAudioEnabledForRole, playStationTransitionCue, playTimesUpCue } from "../utils/sound";
import { prepareVoiceoverEngine } from "../utils/voiceover";
import { TimesUpEffect } from "../components/TimesUpEffect";

type ParticipantPerformance = PlayerState & {
  displayName: string;
  correct: number;
  partial: number;
  incorrect: number;
  evaluatedTurns: number;
  accuracy: number;
  participation: number;
};

const hostRoomBackupKey = "competency-host-room-emergency-backup";

function readHostRoomBackup() {
  try {
    const value = sessionStorage.getItem(hostRoomBackupKey);
    if (!value) return null;
    const room = JSON.parse(value) as RoomState;
    return room?.code ? room : null;
  } catch {
    return null;
  }
}

function writeHostRoomBackup(room: RoomState) {
  try {
    sessionStorage.setItem(hostRoomBackupKey, JSON.stringify(room));
  } catch {
    // Session storage can be unavailable or full; server-side recovery still runs.
  }
}

function clearHostRoomBackup() {
  try {
    sessionStorage.removeItem(hostRoomBackupKey);
  } catch {
    // Session storage may be unavailable in locked-down browser modes.
  }
}

function ShapeIcon({ shape, className }: { shape: PlayerShape; className?: string }) {
  switch (shape) {
    case "circle": return <CircleIcon className={className} />;
    case "triangle": return <Triangle className={className} />;
    case "square": return <SquareIcon className={className} />;
    case "star": return <Star className={className} />;
    case "umbrella": return <Umbrella className={className} />;
    case "diamond": return <Diamond className={className} />;
    case "hexagon": return <Hexagon className={className} />;
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
    case "diamond": return { text: "text-fuchsia-300", border: "border-fuchsia-300/45", bg: "bg-fuchsia-300/10", ring: "shadow-[0_0_36px_rgba(240,171,252,0.18)]" };
    case "hexagon": return { text: "text-lime-300", border: "border-lime-300/45", bg: "bg-lime-300/10", ring: "shadow-[0_0_36px_rgba(190,242,100,0.16)]" };
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

  return <span className={`rounded-full border px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] ${className}`}>{label}</span>;
}

function StatTile({ label, value, tone = "text-white" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
      <div className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className={`mt-1 font-display text-3xl font-black ${tone}`}>{value}</div>
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
      className={`group grid w-full gap-4 rounded-md border p-5 text-left transition ${active ? `${tone.border} ${tone.bg} ${tone.ring}` : "border-white/10 bg-black/35 hover:border-white/25"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${selecting ? "animate-pulse" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`grid h-16 w-16 flex-none place-items-center rounded-md border ${tone.border} ${active ? "bg-black/40" : "bg-white/[0.04]"}`}>
            {player.shape && <ShapeIcon shape={player.shape} className={`h-10 w-10 ${tone.text}`} />}
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-black uppercase text-white">{player.displayName}</div>
            <div className={`mt-0.5 font-display text-xs font-bold uppercase tracking-[0.18em] ${tone.text}`}>{player.shape ?? "shape pending"}</div>
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
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/45">
          <span>Participation</span>
          <span>{player.participation}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full ${active ? "bg-scrub" : "bg-white/35"}`} style={{ width: `${player.participation}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-black/35 font-display text-sm font-black text-white">
          {player.accuracy}%
        </div>
        <textarea
          value={note}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onNoteChange(event.target.value)}
          className="min-h-12 resize-none rounded-md border border-white/10 bg-panel/80 px-4 py-3 text-sm text-white outline-none focus:border-scrub"
          placeholder="Quick participant note..."
        />
      </div>
    </motion.button>
  );
}

function HudPill({ label, value, tone = "text-white" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] px-4 py-3">
      <div className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/35">{label}</div>
      <div className={`mt-1 truncate font-display text-2xl font-black uppercase ${tone}`}>{value}</div>
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
    <div className="rounded-md border border-white/10 bg-black/35 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-monitor">Current station</div>
          <div className="mt-2 truncate font-display text-4xl font-black uppercase leading-none text-white">
            {station?.shortTitle ?? "Select a station"}
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-[620px] sm:grid-cols-5">
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
  const { status, room, error, clientId, finishedAt, send, clearError } = useRoomSocket();
  const navigate = useNavigate();
  const { setNavHidden } = useAppChrome();
  const initialHostRoomBackup = useMemo(readHostRoomBackup, []);
  const [participantNotes, setParticipantNotes] = useState<Record<string, string>>({});
  const [effectVisible, setEffectVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [isScenarioClosing, setIsScenarioClosing] = useState(false);
  const [stationTransitionVisible, setStationTransitionVisible] = useState(false);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [dismissedStationCompleteId, setDismissedStationCompleteId] = useState<string | null>(null);
  const [introKeySeen, setIntroKeySeen] = useState("");
  const [protocolIntroSeenAt, setProtocolIntroSeenAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [timesUpVisible, setTimesUpVisible] = useState(false);
  const [localVoiceReady, setLocalVoiceReady] = useState(false);
  const [localVoiceMode, setLocalVoiceMode] = useState<"warming" | "piper" | "fallback">("warming");
  const stationIdRef = useRef<string>("");
  const timesUpTimerRef = useRef<number | null>(null);
  const timesUpCloseTimeoutRef = useRef<number | null>(null);
  const activeRoomCodeRef = useRef(initialHostRoomBackup?.code ?? "");
  const resumeAttemptedForClientRef = useRef("");
  const latestRoomRef = useRef<RoomState | null>(initialHostRoomBackup);
  const effectsAudioEnabled = isAudioEnabledForRole("host", "effects");
  const trackAudioEnabled = isAudioEnabledForRole("host", "tracks");

  const station = room?.selectedStation as CompetencyStation | null | undefined;
  const prompt = station?.prompts[room?.activePromptIndex ?? 0] as CompetencyPrompt | undefined;
  const stationId = station?.id ?? "";
  const isStrokeStation = station?.id === "stroke";
  const promptUsesSelection = Boolean(prompt && prompt.type !== "activity" && prompt.type !== "group-response");
  const totalPrompts = station?.prompts.length ?? 0;
  const evaluations = room?.evaluations ?? {};
  const evaluationList = useMemo(() => Object.values(evaluations), [evaluations]);
  const currentEvaluation = prompt ? evaluations[prompt.id] : undefined;
  const connectedParticipants = room?.players.filter((player) => player.connected).length ?? 0;
  const stationCompletedCount = station ? station.prompts.filter((item) => evaluations[item.id]).length : 0;
  const stationRemaining = Math.max(0, totalPrompts - stationCompletedCount);
  const stationComplete = Boolean(station && totalPrompts > 0 && stationCompletedCount >= totalPrompts);
  const allPromptsTotal = useMemo(() => stations.reduce((sum, item) => sum + item.prompts.length, 0), []);
  const allStationsComplete = room?.status === "in-progress" && allPromptsTotal > 0 && evaluationList.length >= allPromptsTotal;
  const connectionLabel =
    status === "open" ? "Connected" : status === "connecting" ? "Connecting" : status === "closed" ? "Disconnected" : "Connection issue";
  const preselectedStation = useMemo(() => {
    const stationId = new URLSearchParams(window.location.search).get("station");
    return stations.find((item) => item.id === stationId);
  }, []);
  const learnerUrl = room?.code ? `${window.location.origin}/player?room=${encodeURIComponent(room.code)}` : `${window.location.origin}/player`;
  const introKey = room?.introStartedAt && station ? `${room.code}-${room.introStartedAt}` : "";
  const voiceoverReady = Boolean(room?.voiceoverReady.host && room?.voiceoverReady.player);
  const hostVoiceLabel = room?.voiceoverReady.host
    ? localVoiceMode === "fallback"
      ? "Host fallback ready"
      : "Host Piper ready"
    : localVoiceReady
      ? "Host ready, syncing"
      : "Host warming";
  const learnerVoiceLabel = room?.voiceoverReady.player ? "Learner ready" : "Learner warming";
  const canStartSession = Boolean(station && room && room.status !== "in-progress" && connectedParticipants >= 2 && connectedParticipants <= 7 && voiceoverReady);
  const launchChecklist = [
    { label: "Station", value: station?.shortTitle ?? "Choose station", ready: Boolean(station) },
    { label: "Participants", value: `${connectedParticipants}/7 connected`, ready: connectedParticipants >= 2 && connectedParticipants <= 7 },
    {
      label: "Voice",
      value: voiceoverReady
        ? "Ready"
        : room?.voiceoverReady.host
          ? learnerVoiceLabel
          : hostVoiceLabel,
      ready: voiceoverReady
    },
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

  const stationCompleteSummary = useMemo(() => {
    const stationEvaluations = station?.prompts.map((item) => evaluations[item.id]).filter(Boolean) ?? [];
    return {
      total: station?.prompts.length ?? 0,
      correct: stationEvaluations.filter((item) => item.status === "correct").length,
      partial: stationEvaluations.filter((item) => item.status === "partial").length,
      incorrect: stationEvaluations.filter((item) => item.status === "incorrect").length
    };
  }, [evaluations, station]);

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
    if (!finishedAt) return;
    activeRoomCodeRef.current = "";
    latestRoomRef.current = null;
    clearHostRoomBackup();
    navigate("/complete?role=host", { replace: true });
  }, [finishedAt, navigate]);

  useEffect(() => {
    if (room?.code) {
      latestRoomRef.current = room;
      activeRoomCodeRef.current = room.code;
      writeHostRoomBackup(room);
    }
  }, [room]);

  useEffect(() => {
    if (status !== "open" || !clientId || !activeRoomCodeRef.current) return;
    if (resumeAttemptedForClientRef.current === clientId) return;
    resumeAttemptedForClientRef.current = clientId;
    send({ type: "resume-host", code: activeRoomCodeRef.current, room: latestRoomRef.current ?? undefined });
  }, [clientId, send, status]);

  useEffect(() => {
    if (!error || room) return;
    activeRoomCodeRef.current = "";
  }, [error, room]);

  useEffect(() => {
    if (room && !station && preselectedStation) {
      send({ type: "open-station", station: preselectedStation });
    }
  }, [preselectedStation, room, send, station]);

  useEffect(() => {
    setDismissedStationCompleteId(null);
  }, [stationId]);

  useEffect(() => {
    if (!currentEvaluation?.evaluatedAt) return;
    setEffectVisible(true);
    const timeout = window.setTimeout(() => setEffectVisible(false), 1300);
    return () => window.clearTimeout(timeout);
  }, [currentEvaluation?.evaluatedAt]);

  useEffect(() => {
    if (!room?.timerEndsAt) {
      timesUpTimerRef.current = null;
      setTimesUpVisible(false);
      if (timesUpCloseTimeoutRef.current) {
        window.clearTimeout(timesUpCloseTimeoutRef.current);
        timesUpCloseTimeoutRef.current = null;
      }
      return;
    }

    const timerEndsAt = room.timerEndsAt;
    if (timesUpTimerRef.current === timerEndsAt) return;
    const localServerOffset = room.serverTime ? Date.now() - room.serverTime : 0;
    const serverNow = Date.now() - localServerOffset;
    const remainingMs = Math.max(0, timerEndsAt - serverNow);
    const showTimeout = window.setTimeout(() => {
      if (timesUpTimerRef.current === timerEndsAt) return;
      timesUpTimerRef.current = timerEndsAt;
      setTimesUpVisible(true);
      if (effectsAudioEnabled) playTimesUpCue();
      if (timesUpCloseTimeoutRef.current) window.clearTimeout(timesUpCloseTimeoutRef.current);
      timesUpCloseTimeoutRef.current = window.setTimeout(() => {
        setTimesUpVisible(false);
        timesUpCloseTimeoutRef.current = null;
      }, 2000);
    }, remainingMs);

    return () => window.clearTimeout(showTimeout);
  }, [effectsAudioEnabled, room?.serverTime, room?.timerEndsAt]);

  useEffect(() => {
    return () => {
      if (timesUpCloseTimeoutRef.current) window.clearTimeout(timesUpCloseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!introKey || introKeySeen === introKey) return;
    setIntroVisible(true);
  }, [introKey, introKeySeen]);

  useEffect(() => {
    let cancelled = false;
    setLocalVoiceReady(false);
    setLocalVoiceMode("warming");
    prepareVoiceoverEngine().then((piperReady) => {
      if (cancelled) return;
      setLocalVoiceReady(true);
      setLocalVoiceMode(piperReady ? "piper" : "fallback");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!room || room.voiceoverReady.host || !localVoiceReady) return;
    send({ type: "voiceover-ready", ready: true });
  }, [localVoiceReady, room?.code, room?.voiceoverReady.host, send]);

  useEffect(() => {
    setNavHidden(introVisible || Boolean(room && room.status !== "lobby"));
    return () => setNavHidden(false);
  }, [introVisible, room, setNavHidden]);

  useEffect(() => {
    if (room?.introStartedAt) return;
    setIntroVisible(false);
  }, [room?.introStartedAt]);

  const closeIntro = useCallback(() => {
    setIntroKeySeen(introKey);
    setIsScenarioClosing(true);
    send({ type: "start-protocol-assignment" });

    setTimeout(() => {
      setIntroVisible(false);
      setIsScenarioClosing(false);
    }, 1000);
  }, [introKey, send]);

  const skipIntro = useCallback(() => {
    send({ type: "skip-intro-to-patient-review", elapsedMs: 45000 });
  }, [send]);

  const protocolIntroVisible = Boolean(
    room?.protocolIntroStartedAt &&
    room.protocolIntroStartedAt !== protocolIntroSeenAt &&
    !introVisible &&
    !room.introStartedAt
  );

  const completeProtocolIntro = useCallback(() => {
    setProtocolIntroSeenAt(room?.protocolIntroStartedAt ?? null);
    setStationTransitionVisible(true);
    window.setTimeout(() => {
      setStationTransitionVisible(false);
      if (promptUsesSelection) send({ type: "start-selection" });
    }, 3600);
  }, [promptUsesSelection, room?.protocolIntroStartedAt, send]);

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
        if (effectsAudioEnabled) playStationTransitionCue();
      } catch {
        // Browsers can block audio until interaction.
      }
    }, 20);
    const timeout = window.setTimeout(() => setStationTransitionVisible(false), 3600);
    return () => {
      window.clearTimeout(showId);
      window.clearTimeout(timeout);
    };
  }, [effectsAudioEnabled, introVisible, protocolIntroVisible, room?.status, stationId]);

  function evaluate(statusValue: EvaluationStatus) {
    if (!prompt || (promptUsesSelection && !room?.currentParticipantId)) return;
    const playerId = promptUsesSelection ? room?.currentParticipantId ?? undefined : undefined;
    send({ type: "evaluate-prompt", promptId: prompt.id, playerId, status: statusValue, flagged: false });
  }

  function startSimulation() {
    if (!station || !canStartSession) return;
    send({ type: "start-session" });
  }

  function startStationsNow() {
    if (!station || !canStartSession) return;
    setIntroVisible(false);
    setProtocolIntroSeenAt(Date.now());
    setStationTransitionVisible(false);
    send({ type: "start-session-now" });
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
    <section className="w-full max-w-none px-3 py-6 sm:px-4 lg:px-5">
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
            <h2 className="font-display text-3xl font-bold uppercase tracking-[0.08em] text-white">Start an online simulation room</h2>
            <p className="mt-3 max-w-2xl text-white/65">
              Create the room, have the learner screen join with 2-7 participant names, select a station, then start the simulation intro.
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
        <div className="grid gap-5 lg:grid-cols-[minmax(300px,340px)_minmax(0,1fr)_minmax(280px,330px)] xl:grid-cols-[360px_minmax(0,1fr)_380px] 2xl:grid-cols-[380px_minmax(0,1fr)_400px]">
          <aside className="grid min-w-0 content-start gap-5 overflow-hidden">
            {room.status === "lobby" && (
              <div className="min-w-0 overflow-hidden rounded-md border border-scrub/20 bg-[linear-gradient(180deg,rgba(34,245,199,0.07),rgba(0,0,0,0.32))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.26)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-white/45">Room code</div>
                    <div className="mt-1 font-display text-6xl font-black leading-none text-scrub">{room.code}</div>
                  </div>
                  <StatusChip label="Staging" />
                </div>

                <div className="mt-4 grid gap-2">
                  {launchChecklist.map((item) => (
                    <div key={item.label} className="grid min-w-0 grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] items-center gap-3 rounded-md border border-white/10 bg-black/25 px-4 py-3">
                      <div className="min-w-0 truncate font-display text-xs font-bold uppercase tracking-[0.16em] text-white/42">{item.label}</div>
                      <div className={`flex min-w-0 items-center justify-end gap-2 text-right text-sm font-semibold ${item.ready ? "text-scrub" : "text-amber"}`}>
                        <span className={`h-2 w-2 rounded-full ${item.ready ? "bg-scrub shadow-scrub" : "bg-amber"}`} />
                        <span className="min-w-0 truncate">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
                  <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Narration readiness</div>
                  {[
                    { label: "Host", ready: Boolean(room.voiceoverReady.host), value: hostVoiceLabel },
                    { label: "Learner", ready: Boolean(room.voiceoverReady.player), value: learnerVoiceLabel }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
                      <div className="font-display text-xs font-black uppercase tracking-[0.14em] text-white/50">{item.label}</div>
                      <div className={`flex items-center gap-2 text-sm font-semibold ${item.ready ? "text-scrub" : "text-amber"}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${item.ready ? "bg-scrub shadow-[0_0_14px_rgba(34,245,199,0.7)]" : "bg-amber"}`} />
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 min-w-0 overflow-hidden rounded-md border border-monitor/20 bg-monitor/10 p-4">
                  <div className="font-display text-xs font-bold uppercase tracking-[0.16em] text-monitor">Learner website URL</div>
                  <div className="mt-2 break-all text-base leading-6 text-white/75">{learnerUrl}</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <AnimatedButton variant="ghost" onClick={() => navigator.clipboard.writeText(room.code)}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </AnimatedButton>
                  <AnimatedButton variant="secondary" onClick={startSimulation} disabled={!canStartSession}>
                    <Play className="h-4 w-4" />
                    Start intro
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" className="col-span-2" onClick={startStationsNow} disabled={!canStartSession}>
                    <SkipForward className="h-4 w-4" />
                    Start stations
                  </AnimatedButton>
                </div>
                {!station && <p className="mt-3 text-sm text-amber">Choose a station before starting.</p>}
                {station && connectedParticipants < 2 && (
                  <p className="mt-3 text-sm text-amber">The learner screen must join with 2-7 participant names before the intro can start.</p>
                )}
                {station && connectedParticipants >= 2 && (
                  <p className="mt-3 text-sm text-scrub">
                    {isStrokeStation ? "Ready. The intro plays once, then Stroke activities begin. Later Stroke questions will use random selection." : "Ready. The intro plays once, then participant selection begins."}
                  </p>
                )}
              </div>
            )}

            <div className="min-w-0 overflow-hidden rounded-md border border-white/10 bg-black/35 p-5">
              <div className="mb-4 font-display text-base font-bold uppercase tracking-[0.18em] text-monitor">Station navigation</div>
              <div className="grid gap-3">
                {stations.map((item, index) => {
                  const isActive = item.id === station?.id;
                  const progress = stationProgress.get(item.id);
                  const completedStation = Boolean(progress?.done);
                  return (
                    <button
                      key={item.id}
                      disabled={stationNavigationLocked || completedStation}
                      onClick={() => {
                        if (completedStation) return;
                        send({ type: "open-station", station: item });
                      }}
                      className={`min-w-0 rounded-md border px-4 py-4 text-left transition ${isActive
                        ? "border-scrub/50 bg-scrub/10 text-scrub"
                        : completedStation
                          ? "border-scrub/25 bg-scrub/[0.055] text-white/55"
                          : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25"
                        } ${stationNavigationLocked || completedStation ? "cursor-not-allowed opacity-45" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 truncate font-display text-base font-bold uppercase tracking-[0.12em]">{index + 1}. {item.shortTitle}</div>
                        {completedStation ? (
                          <span className="rounded-full border border-scrub/35 bg-scrub/10 px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-[0.12em] text-scrub">
                            Complete
                          </span>
                        ) : isActive ? (
                          <span className="rounded-full border border-monitor/35 bg-monitor/10 px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-[0.12em] text-monitor">
                            Live
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${completedStation ? "bg-scrub" : isActive ? "bg-monitor" : "bg-white/35"}`}
                            style={{ width: `${progress?.total ? Math.round((progress.completed / progress.total) * 100) : 0}%` }}
                          />
                        </div>
                        <div className="font-display text-xs font-black text-white/45">{progress?.completed ?? 0}/{progress?.total ?? item.prompts.length}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="grid min-w-0 content-start gap-5">
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
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
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
                  room.status === "in-progress" ? <div className="rounded-md border border-amber/20 bg-amber/10 p-4 text-base text-amber">
                    Mark this question Correct, Partial, or Incorrect before moving on.
                  </div> : null
                )}
                {atLastPrompt && currentEvaluation && (
                  <div className="rounded-md border border-monitor/20 bg-monitor/10 p-4 text-base text-monitor">
                    Station complete. Choose the next station from the station navigation list.
                  </div>
                )}
              </>
            )}
          </main>

          <aside className="grid min-w-0 content-start gap-5">
            <CountdownTimer endsAt={room.timerEndsAt} startedAt={room.timerStartedAt} serverTime={room.serverTime} audioEnabled={effectsAudioEnabled} />
            <div className="grid grid-cols-3 gap-3">
              <AnimatedButton variant="secondary" onClick={() => send({ type: "start-timer", seconds: 15 })} disabled={!prompt}>
                15s
              </AnimatedButton>
              <AnimatedButton variant="secondary" onClick={() => send({ type: "start-timer", seconds: 30 })} disabled={!prompt}>
                30s
              </AnimatedButton>
              <AnimatedButton variant="secondary" onClick={() => send({ type: "start-timer", seconds: 60 })} disabled={!prompt}>
                60s
              </AnimatedButton>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AnimatedButton variant="ghost" onClick={() => send({ type: "start-timer", seconds: prompt?.timerSeconds ?? 60 })} disabled={!prompt}>
                <Timer className="h-4 w-4" />
                Custom
              </AnimatedButton>
              <AnimatedButton variant="ghost" onClick={() => send({ type: "reset-timer" })}>
                <PauseCircle className="h-4 w-4" />
                Reset
              </AnimatedButton>
            </div>

            <div className="rounded-md border border-white/10 bg-black/35 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="font-display text-base font-bold uppercase tracking-[0.18em] text-monitor">Evaluation</div>
                <ClipboardList className="h-5 w-5 text-monitor" />
              </div>
              {activeParticipant ? (
                <div className={`mb-4 rounded-md border p-4 ${shapeTone(activeParticipant.shape).border} ${shapeTone(activeParticipant.shape).bg}`}>
                  <div className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/45">Evaluating</div>
                  <div className="mt-1 font-display text-2xl font-black uppercase text-white">{activeParticipant.displayName}</div>
                </div>
              ) : !promptUsesSelection ? (
                <div className="mb-4 rounded-md border border-monitor/25 bg-monitor/10 p-4 text-sm leading-6 text-monitor">
                  This prompt is scored as a group response. No random participant selection is required.
                </div>
              ) : null}
              <div className="mt-4 grid gap-3">
                <AnimatedButton variant="secondary" onClick={() => evaluate("correct")} disabled={!prompt || (promptUsesSelection && !activeParticipant)}>
                  <Check className="h-4 w-4" />
                  Correct
                </AnimatedButton>
                <AnimatedButton variant="ghost" onClick={() => evaluate("partial")} disabled={!prompt || (promptUsesSelection && !activeParticipant)}>
                  Partial
                </AnimatedButton>
                <AnimatedButton variant="danger" onClick={() => evaluate("incorrect")} disabled={!prompt || (promptUsesSelection && !activeParticipant)}>
                  <X className="h-4 w-4" />
                  Incorrect
                </AnimatedButton>
              </div>
            </div>

            <div className="grid gap-3 rounded-md border border-white/10 bg-black/25 p-4">
              <AnimatedButton variant="danger" onClick={() => setEndConfirmOpen(true)}>
                <Power className="h-4 w-4" />
                End session
              </AnimatedButton>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-monitor">Participants</div>
                <h3 className="font-display text-3xl font-black uppercase text-white">Turn balance and individual performance</h3>
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
                  disabled={room.status !== "in-progress" || !promptUsesSelection}
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
      <TimesUpEffect visible={timesUpVisible} subtle onClose={() => setTimesUpVisible(false)} />
      <EvaluationEffect status={currentEvaluation?.status} visible={effectVisible} subtle audioEnabled={effectsAudioEnabled} />
      <ScenarioIntro
        open={introVisible}
        role="host"
        audioEffectsEnabled={effectsAudioEnabled}
        audioTracksEnabled={trackAudioEnabled}
        startedAt={room?.introStartedAt}
        serverTime={room?.serverTime}
        patientReviewReviewedFileIds={room?.patientReviewReviewedFileIds ?? []}
        patientReviewActiveFileId={room?.patientReviewActiveFileId}
        onReviewPatientFile={(fileId) => send({ type: "review-patient-file", fileId })}
        isClosing={isScenarioClosing}
        canSkip
        onClose={closeIntro}
        onSkip={skipIntro}
      />
      <ProtocolIntro
        open={protocolIntroVisible}
        startedAt={room?.protocolIntroStartedAt ?? null}
        serverTime={room?.serverTime}
        players={room?.players ?? []}
        audioEnabled={trackAudioEnabled}
        canSkip
        onSkip={() => {
          send({ type: "skip-protocol-assignment" });
          completeProtocolIntro();
        }}
        onComplete={() => {
          completeProtocolIntro();
        }}
      />
      <StationTransition station={station ?? null} visible={stationTransitionVisible} />
      <StationCompleteOverlay
        visible={Boolean(
          room?.status === "in-progress" &&
          station &&
          stationComplete &&
          dismissedStationCompleteId !== station.id &&
          !introVisible &&
          !protocolIntroVisible &&
          !stationTransitionVisible &&
          !room.debriefStartedAt &&
          !room.closingStartedAt
        )}
        role="host"
        stationTitle={station?.title ?? "Station"}
        summary={stationCompleteSummary}
        allStationsComplete={allStationsComplete}
        onChooseNext={() => setDismissedStationCompleteId(station?.id ?? null)}
        onStartDebrief={() => send({ type: "show-debrief" })}
      />
      {promptUsesSelection && <SelectionRoulette selection={room?.selection ?? null} serverTime={room?.serverTime} players={room?.players ?? []} clientId={clientId} />}
      <Modal open={endConfirmOpen} title="End session?" onClose={() => setEndConfirmOpen(false)}>
        <div className="grid gap-4">
          <p className="text-white/75">
            This will mark any remaining station questions as missed and move the room into the debrief.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <AnimatedButton variant="ghost" onClick={() => setEndConfirmOpen(false)}>
              Cancel
            </AnimatedButton>
            <AnimatedButton
              variant="danger"
              onClick={() => {
                setEndConfirmOpen(false);
                endSession();
              }}
            >
              End session
            </AnimatedButton>
          </div>
        </div>
      </Modal>
      <SessionDebrief
        room={room ?? null}
        role="host"
        audioEnabled={trackAudioEnabled}
        onDownload={downloadMissedReport}
        onClosing={() => send({ type: "show-closing" })}
        onEnd={() => send({ type: "finish-session" })}
        onDebriefViewChange={(view) => send({ type: "set-debrief-view", ...view })}
      />
    </section>
  );
}
