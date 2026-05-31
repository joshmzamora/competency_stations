import { Circle as CircleIcon, LogOut, Minus, Plus, Radio, ShieldAlert, Square as SquareIcon, Star, Triangle, Umbrella } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ActivityPromptLayout } from "../components/ActivityPromptLayout";
import { AnimatedButton } from "../components/AnimatedButton";
import { CountdownTimer } from "../components/CountdownTimer";
import { EvaluationEffect } from "../components/EvaluationEffect";
import { Modal } from "../components/Modal";
import { ProtocolIntro } from "../components/ProtocolIntro";
import { ScenarioIntro } from "../components/ScenarioIntro";
import { SelectionRoulette } from "../components/SelectionRoulette";
import { SessionDebrief } from "../components/SessionDebrief";
import { StationTransition } from "../components/StationTransition";
import { useAppChrome } from "../context/ChromeContext";
import { useRoomSocket } from "../hooks/useRoomSocket";
import type { ActivityState, PlayerPrompt, PlayerShape, PlayerState, PlayerStation, PromptEvaluation } from "../types";
import { playStationTransitionCue } from "../utils/sound";

type PlayerPerformance = PlayerState & {
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
  if (!name) return "Participant";
  const match = name.match(/\((.*)\)/);
  return match?.[1] || name;
}

function shapeTone(shape?: PlayerShape) {
  switch (shape) {
    case "circle": return { text: "text-scrub", border: "border-scrub/45", bg: "bg-scrub/10", shadow: "shadow-[0_0_44px_rgba(34,245,199,0.2)]" };
    case "triangle": return { text: "text-trauma", border: "border-trauma/45", bg: "bg-trauma/10", shadow: "shadow-[0_0_44px_rgba(255,48,77,0.22)]" };
    case "square": return { text: "text-monitor", border: "border-monitor/45", bg: "bg-monitor/10", shadow: "shadow-[0_0_44px_rgba(110,247,255,0.18)]" };
    case "star": return { text: "text-amber", border: "border-amber/45", bg: "bg-amber/10", shadow: "shadow-[0_0_44px_rgba(255,176,32,0.18)]" };
    case "umbrella": return { text: "text-white", border: "border-white/35", bg: "bg-white/10", shadow: "shadow-[0_0_38px_rgba(255,255,255,0.12)]" };
    default: return { text: "text-white/40", border: "border-white/10", bg: "bg-white/[0.04]", shadow: "" };
  }
}

function percent(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

function weightedAccuracy(correct: number, partial: number, total: number) {
  return total ? Math.round(((correct * 100 + partial * 50) / (total * 100)) * 100) : 0;
}

function StatTile({ label, value, tone = "text-white" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className={`mt-1 font-display text-2xl font-black ${tone}`}>{value}</div>
    </div>
  );
}

function ParticipantBoard({ players, activeId }: { players: PlayerPerformance[]; activeId?: string | null }) {
  if (players.length === 0) return null;
  const totalCompleted = players.reduce((sum, player) => sum + player.evaluatedTurns, 0);
  const groupCorrect = players.reduce((sum, player) => sum + player.correct, 0);
  const groupPartial = players.reduce((sum, player) => sum + player.partial, 0);
  const groupIncorrect = players.reduce((sum, player) => sum + player.incorrect, 0);
  const groupAccuracy = weightedAccuracy(groupCorrect, groupPartial, totalCompleted);

  return (
    <div className="grid gap-3 rounded-md border border-white/10 bg-black/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-monitor">Participants</div>
        </div>
        <div className="flex flex-wrap gap-2 text-right">
          <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2"><span className="text-[10px] uppercase tracking-[0.14em] text-white/35">Done </span><span className="font-display text-sm font-black text-white">{totalCompleted}</span></div>
          <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2"><span className="text-[10px] uppercase tracking-[0.14em] text-white/35">Accuracy </span><span className="font-display text-sm font-black text-scrub">{groupAccuracy}%</span></div>
          <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2"><span className="text-[10px] uppercase tracking-[0.14em] text-white/35">Missed </span><span className="font-display text-sm font-black text-trauma">{groupIncorrect}</span></div>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {players.map((player) => {
          const active = player.id === activeId;
          const tone = shapeTone(player.shape);
          const status = active ? "Active" : player.turnCount > 0 ? "Standby" : "Ready";
          return (
            <motion.div
              key={player.id}
              layout
              className={`rounded-md border p-3 transition ${
                active ? `${tone.border} ${tone.bg} ${tone.shadow}` : "border-white/10 bg-white/[0.035] opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`grid h-11 w-11 flex-none place-items-center rounded-md border ${tone.border} bg-black/30`}>
                    {player.shape && <ShapeIcon shape={player.shape} className={`h-7 w-7 ${tone.text}`} />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm font-black uppercase text-white">{player.displayName}</div>
                    <div className={`mt-0.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] ${tone.text}`}>{player.shape ?? "shape pending"}</div>
                  </div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] ${
                  active ? "border-scrub/35 bg-scrub/10 text-scrub" : "border-white/10 bg-white/[0.04] text-white/45"
                }`}>
                  {status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
                <div className="rounded-md bg-black/25 p-1.5"><div className="text-[8px] uppercase text-white/35">Turns</div><div className="font-display text-sm font-black">{player.turnCount}</div></div>
                <div className="rounded-md bg-black/25 p-1.5"><div className="text-[8px] uppercase text-white/35">Right</div><div className="font-display text-sm font-black text-scrub">{player.correct}</div></div>
                <div className="rounded-md bg-black/25 p-1.5"><div className="text-[8px] uppercase text-white/35">Part</div><div className="font-display text-sm font-black text-amber">{player.partial}</div></div>
                <div className="rounded-md bg-black/25 p-1.5"><div className="text-[8px] uppercase text-white/35">Miss</div><div className="font-display text-sm font-black text-trauma">{player.incorrect}</div></div>
                <div className="rounded-md bg-black/25 p-1.5"><div className="text-[8px] uppercase text-white/35">Acc</div><div className={`font-display text-sm font-black ${player.accuracy >= 80 ? "text-scrub" : player.accuracy >= 50 ? "text-amber" : "text-trauma"}`}>{player.accuracy}%</div></div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-label={`Participation ${player.participation}%`}>
                  <div className={`h-full rounded-full ${active ? "bg-scrub" : "bg-white/35"}`} style={{ width: `${player.participation}%` }} />
                </div>
                <span className="font-display text-[10px] font-black text-white/45">{player.participation}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ActivePromptView({
  prompt,
  station,
  activeParticipant,
  promptNumber,
  totalPrompts,
  activityState,
  onMoveActivityCard,
  onCheckActivity
}: {
  prompt: PlayerPrompt;
  station: PlayerStation;
  activeParticipant?: PlayerState;
  promptNumber: number;
  totalPrompts: number;
  activityState?: ActivityState;
  onMoveActivityCard: (item: string, column: string | null) => void;
  onCheckActivity: () => void;
}) {
  const tone = shapeTone(activeParticipant?.shape);
  const usesSelection = prompt.type !== "activity";

  return (
    <motion.div
      key={`${prompt.id}-${activeParticipant?.id ?? "none"}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid gap-5 rounded-md border border-white/10 bg-black/45 p-5 md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-monitor">{station.title}</div>
          <div className="mt-1 text-sm text-white/45">Question {promptNumber} of {totalPrompts}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 font-display text-xs font-black uppercase tracking-[0.16em] text-white/65">
          {prompt.type.replace(/-/g, " ")}
        </div>
      </div>

      {usesSelection ? (
        <div className={`grid gap-5 rounded-md border p-5 md:grid-cols-[170px_1fr] md:items-center ${tone.border} ${tone.bg}`}>
          <motion.div
            initial={{ scale: 0.75, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 230, damping: 18 }}
            className={`grid aspect-square place-items-center rounded-md border ${tone.border} bg-black/30 ${tone.shadow}`}
          >
            {activeParticipant?.shape && <ShapeIcon shape={activeParticipant.shape} className={`h-24 w-24 ${tone.text}`} />}
          </motion.div>
          <div>
            <div className={`font-display text-xs font-black uppercase tracking-[0.28em] ${tone.text}`}>You have been selected</div>
            <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">{publicName(activeParticipant?.name)}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-white/68">
              Respond verbally or perform the skill. The evaluator will mark the result.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-monitor/25 bg-monitor/10 p-5">
          <div className="font-display text-xs font-black uppercase tracking-[0.24em] text-monitor">Stroke activity mode</div>
          <p className="mt-2 max-w-3xl text-lg leading-7 text-white/68">
            Work together on the learner screen. Drag the cards into the correct columns, then use up to two checks.
          </p>
        </div>
      )}

      {prompt.type === "activity" ? (
        <ActivityPromptLayout
          prompt={prompt}
          activityState={activityState}
          onMoveCard={onMoveActivityCard}
          onCheck={onCheckActivity}
        />
      ) : (
        <div className="rounded-md border border-monitor/25 bg-monitor/10 p-5 md:p-7">
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-monitor">Scenario question</div>
          <p className="mt-4 text-2xl leading-10 text-white/84">{prompt.scenario}</p>
        </div>
      )}
    </motion.div>
  );
}

export function PlayerPage() {
  const { status, room, error, clientId, finishedAt, send, clearError } = useRoomSocket();
  const navigate = useNavigate();
  const { setNavHidden } = useAppChrome();
  const [code, setCode] = useState(() => localStorage.getItem("competency-player-room-code") ?? "");
  const [names, setNames] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("competency-player-names") ?? "null") as unknown;
      return Array.isArray(saved) && saved.length >= 2 ? saved.map(String).slice(0, 5) : ["", ""];
    } catch {
      return ["", ""];
    }
  });
  const [effectVisible, setEffectVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [stationTransitionVisible, setStationTransitionVisible] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [introKeySeen, setIntroKeySeen] = useState("");
  const [protocolIntroSeenAt, setProtocolIntroSeenAt] = useState<number | null>(null);
  const stationIdRef = useRef<string>("");
  const reconnectAttemptedRef = useRef(false);
  const groupIdRef = useRef(
    localStorage.getItem("competency-player-group-id") ??
      (() => {
        const id = crypto.randomUUID();
        localStorage.setItem("competency-player-group-id", id);
        return id;
      })()
  );

  const station = room?.selectedStation as PlayerStation | null | undefined;
  const prompt = station?.prompts[room?.activePromptIndex ?? 0];
  const stationId = station?.id ?? "";
  const isStrokeStation = station?.id === "stroke";
  const isLive = room?.status === "in-progress";
  const activePrompt = isLive ? prompt : undefined;
  const activePromptUsesSelection = Boolean(activePrompt && activePrompt.type !== "activity");
  const activeParticipant = useMemo(() => room?.players.find((player) => player.id === room.currentParticipantId), [room?.currentParticipantId, room?.players]);
  const currentEvaluation = activePrompt ? room?.evaluations?.[activePrompt.id] : undefined;
  const introKey = room?.introStartedAt && station ? `${room.code}-${room.introStartedAt}` : "";
  const validNames = names.map((name) => name.trim()).filter(Boolean);
  const evaluations = room?.evaluations ?? {};
  const evaluationList = useMemo(() => Object.values(evaluations), [evaluations]);

  const participantStats = useMemo<PlayerPerformance[]>(() => {
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

  useEffect(() => {
    if (clientId) reconnectAttemptedRef.current = false;
  }, [clientId]);

  useEffect(() => {
    if (!finishedAt) return;
    localStorage.removeItem("competency-player-room-code");
    localStorage.removeItem("competency-player-names");
    navigate("/complete?role=player", { replace: true });
  }, [finishedAt, navigate]);

  useEffect(() => {
    if (!currentEvaluation?.evaluatedAt) return;
    setEffectVisible(true);
    const timeout = window.setTimeout(() => setEffectVisible(false), 1700);
    return () => window.clearTimeout(timeout);
  }, [currentEvaluation?.evaluatedAt]);

  useEffect(() => {
    if (status !== "open" || room || reconnectAttemptedRef.current) return;
    const savedCode = localStorage.getItem("competency-player-room-code");
    let savedNames: string[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem("competency-player-names") ?? "[]") as unknown;
      savedNames = Array.isArray(parsed) ? parsed.map(String).filter(Boolean).slice(0, 5) : [];
    } catch {
      savedNames = [];
    }
    if (!savedCode || savedNames.length < 2) return;
    reconnectAttemptedRef.current = true;
    setCode(savedCode);
    setNames(savedNames);
    send({ type: "join-room", code: savedCode, names: savedNames, groupId: groupIdRef.current });
  }, [room, send, status]);

  useEffect(() => {
    if (!introKey || introKeySeen === introKey) return;
    setIntroVisible(true);
  }, [introKey, introKeySeen]);

  useEffect(() => {
    setNavHidden(Boolean(room));
    return () => setNavHidden(false);
  }, [room, setNavHidden]);

  useEffect(() => {
    if (room?.introStartedAt) return;
    setIntroVisible(false);
  }, [room?.introStartedAt]);

  const protocolIntroVisible = Boolean(
    room?.protocolIntroStartedAt &&
    room.protocolIntroStartedAt !== protocolIntroSeenAt &&
    !introVisible &&
    !room.introStartedAt
  );

  const completeProtocolIntro = useCallback(() => {
    setProtocolIntroSeenAt(room?.protocolIntroStartedAt ?? null);
    setStationTransitionVisible(true);
    window.setTimeout(() => setStationTransitionVisible(false), 3600);
  }, [room?.protocolIntroStartedAt]);

  const closeIntro = useCallback(() => {
    setIntroKeySeen(introKey);
    setIntroVisible(false);
  }, [introKey]);

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
    const timeout = window.setTimeout(() => setStationTransitionVisible(false), 3600);
    return () => {
      window.clearTimeout(showId);
      window.clearTimeout(timeout);
    };
  }, [introVisible, protocolIntroVisible, room?.status, stationId]);

  function updateName(index: number, value: string) {
    const next = [...names];
    next[index] = value;
    setNames(next);
  }

  function addPlayer() {
    if (names.length < 5) setNames([...names, ""]);
  }

  function removePlayer(index: number) {
    if (names.length > 2) setNames(names.filter((_, i) => i !== index));
  }

  function join(event: FormEvent) {
    event.preventDefault();
    if (validNames.length < 2 || validNames.length > 5) return;
    localStorage.setItem("competency-player-room-code", code.trim().toUpperCase());
    localStorage.setItem("competency-player-names", JSON.stringify(validNames));
    send({ type: "join-room", code, names: validNames, groupId: groupIdRef.current });
  }

  function leaveRoom() {
    localStorage.removeItem("competency-player-room-code");
    localStorage.removeItem("competency-player-names");
    localStorage.removeItem("competency-player-group-id");
    reconnectAttemptedRef.current = true;
    send({ type: "leave-room" });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {!room ? (
        <>
          <div className="mb-6">
            <div className="font-display text-xs font-bold uppercase tracking-[0.22em] text-scrub">Learner monitor</div>
            <h1 className="mt-2 font-display text-4xl font-black uppercase text-white">Join Simulation</h1>
            <p className="mt-3 max-w-2xl text-white/62">Use one learner computer for the room. Add the names of the 2-5 participants who will take turns answering verbally.</p>
          </div>
          <form onSubmit={join} className="grid gap-6 rounded-md border border-white/10 bg-black/35 p-6">
            <label className="grid gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/55">Room code</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                className="rounded-md border border-scrub/30 bg-panel px-4 py-3 font-display text-3xl font-bold uppercase text-white outline-none focus:border-scrub"
                placeholder="ABCD"
                maxLength={6}
              />
            </label>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/55">Participants (2-5)</span>
                <button
                  type="button"
                  onClick={addPlayer}
                  disabled={names.length >= 5}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3">
                {names.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={name}
                      onChange={(event) => updateName(index, event.target.value)}
                      className="flex-1 rounded-md border border-white/10 bg-panel px-4 py-3 text-white outline-none focus:border-scrub"
                      placeholder={`Participant ${index + 1} name`}
                    />
                    {names.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(index)}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-trauma/30 bg-trauma/10 text-trauma"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {validNames.length < 2 && <p className="text-sm text-amber">Enter at least 2 participant names before joining.</p>}
            <AnimatedButton disabled={status !== "open" || code.trim().length < 4 || validNames.length < 2 || validNames.length > 5}>
              <Radio className="h-4 w-4" />
              Join simulation
            </AnimatedButton>
          </form>
        </>
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 p-4">
            <div>
              <div className="font-display text-xs uppercase tracking-[0.18em] text-white/45">Active station</div>
              <div className="font-display text-3xl font-black uppercase text-white">{station?.title ?? "Waiting for station"}</div>
              {station && !isLive && <p className="mt-1 text-sm text-amber">Station loaded. Waiting for the host to start.</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-md border border-scrub/35 bg-scrub/10 px-4 py-3 text-right">
                <div className="font-display text-[10px] uppercase tracking-[0.18em] text-white/45">Room</div>
                <div className="font-display text-3xl font-black text-scrub">{room.code}</div>
              </div>
              <AnimatedButton variant="ghost" className="min-h-12 px-3" onClick={() => setLeaveConfirmOpen(true)}>
                <LogOut className="h-4 w-4" />
                Leave
              </AnimatedButton>
            </div>
          </div>

          <CountdownTimer endsAt={room.timerEndsAt} />

          {activePrompt && station && (activeParticipant || !activePromptUsesSelection) ? (
            <ActivePromptView
              prompt={activePrompt}
              station={station}
              activeParticipant={activeParticipant}
              promptNumber={(room.activePromptIndex ?? 0) + 1}
              totalPrompts={station.prompts.length}
              activityState={room.activityStates?.[activePrompt.id]}
              onMoveActivityCard={(item, column) => send({ type: "update-activity-card", promptId: activePrompt.id, item, column })}
              onCheckActivity={() => send({ type: "check-activity", promptId: activePrompt.id })}
            />
          ) : (
            <div className="rounded-md border border-amber/25 bg-amber/10 p-8 text-amber">
              <ShieldAlert className="mb-3 h-8 w-8" />
              <div className="font-display text-3xl font-black uppercase text-white">Stand By</div>
              <p className="mt-3 text-white/70">
                {station
                  ? isStrokeStation
                    ? activePromptUsesSelection
                      ? "The host will run the selection animation before the next Stroke question appears."
                      : "The host will advance the Stroke activity when ready."
                    : "The host will run the selection animation before the next question appears."
                  : "The host will select a competency station and start the session."}
              </p>
            </div>
          )}

          <ParticipantBoard players={participantStats} activeId={room.currentParticipantId} />
        </div>
      )}

      <Modal open={Boolean(error)} title="Connection alert" onClose={clearError}>
        <p className="text-white/75">{error}</p>
      </Modal>
      <Modal open={leaveConfirmOpen} title="Leave room?" onClose={() => setLeaveConfirmOpen(false)}>
        <div className="grid gap-4">
          <p className="text-white/75">
            This learner computer will leave the room. You can rejoin later with the room code if the host is still connected.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <AnimatedButton variant="ghost" onClick={() => setLeaveConfirmOpen(false)}>
              Stay
            </AnimatedButton>
            <AnimatedButton
              variant="danger"
              onClick={() => {
                setLeaveConfirmOpen(false);
                leaveRoom();
              }}
            >
              Leave room
            </AnimatedButton>
          </div>
        </div>
      </Modal>
      <EvaluationEffect status={currentEvaluation?.status} visible={effectVisible} />
      <ScenarioIntro
        open={introVisible}
        role="player"
        startedAt={room?.introStartedAt}
        serverTime={room?.serverTime}
        patientReviewReviewedFileIds={room?.patientReviewReviewedFileIds ?? []}
        patientReviewActiveFileId={room?.patientReviewActiveFileId}
        onReviewPatientFile={(fileId) => send({ type: "review-patient-file", fileId })}
        onClose={closeIntro}
      />
      <ProtocolIntro
        open={protocolIntroVisible}
        startedAt={room?.protocolIntroStartedAt ?? null}
        players={room?.players ?? []}
        onComplete={completeProtocolIntro}
      />
      <StationTransition station={station ?? null} visible={stationTransitionVisible} />
      {activePromptUsesSelection && <SelectionRoulette selection={room?.selection ?? null} players={room?.players ?? []} clientId={clientId} />}
      <SessionDebrief room={room ?? null} role="player" />
    </section>
  );
}
