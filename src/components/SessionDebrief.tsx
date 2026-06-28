import { AnimatePresence, motion } from "framer-motion";
import { Circle, Download, Flag, Medal, PartyPopper, Sparkles, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useEffect, useState } from "react";
import { stations } from "../data/stations";
import type { EvaluationStatus, PlayerShape, PromptEvaluation, RoomState } from "../types";
import { playEndScreenTrack, stopEndScreenTrack } from "../utils/endScreenAudio";
import { AnimatedButton } from "./AnimatedButton";

const debriefAudioVolume = 0.12;
const closingCongratulationsAudioVolume = 0.42;
const closingCongratulationsMs = 2400;

function publicName(name?: string) {
  if (!name) return "Participant";
  const match = name.match(/\((.*)\)/);
  return match?.[1] || name;
}

function weightedAccuracy(correct: number, partial: number, total: number) {
  return total ? Math.round(((correct * 100 + partial * 50) / (total * 100)) * 100) : 0;
}

function shapeLabel(shape?: PlayerShape) {
  return shape ? shape.charAt(0).toUpperCase() + shape.slice(1) : "Unassigned";
}

function statusTone(status: EvaluationStatus) {
  if (status === "correct") return "text-scrub";
  if (status === "partial") return "text-amber";
  return "text-trauma";
}

const closingDecorations = [
  { kind: "shape", label: "triangle", Icon: Triangle, tone: "text-trauma", band: "top", left: "8%", top: "20%", rotate: -8, delay: 0 },
  { kind: "cookie", label: "cookie-top-left", band: "top", left: "24%", top: "58%", rotate: 10, delay: 0.1 },
  { kind: "shape", label: "star", Icon: Star, tone: "text-amber", band: "top", left: "62%", top: "16%", rotate: 7, delay: 0.18 },
  { kind: "cookie", label: "cookie-top-right", band: "top", left: "84%", top: "52%", rotate: -12, delay: 0.28 },
  { kind: "cookie", label: "cookie-bottom-left", band: "bottom", left: "10%", top: "18%", rotate: -7, delay: 0.08 },
  { kind: "shape", label: "umbrella", Icon: Umbrella, tone: "text-white", band: "bottom", left: "29%", top: "50%", rotate: 9, delay: 0.16 },
  { kind: "shape", label: "square", Icon: Square, tone: "text-monitor", band: "bottom", left: "52%", top: "22%", rotate: -5, delay: 0.24 },
  { kind: "shape", label: "circle", Icon: Circle, tone: "text-scrub", band: "bottom", left: "74%", top: "56%", rotate: 6, delay: 0.32 },
  { kind: "cookie", label: "cookie-bottom-right", band: "bottom", left: "90%", top: "18%", rotate: 12, delay: 0.4 }
];

function CookieDisk() {
  return (
    <div className="relative h-14 w-14 rounded-full border border-[#d49a57] bg-[#b87836] shadow-[inset_-8px_-10px_0_rgba(57,28,10,0.28),0_0_26px_rgba(255,176,32,0.18)]">
      {[22, 44, 62, 36, 56].map((left, index) => (
        <span
          key={index}
          className="absolute h-2 w-2 rounded-full bg-[#33190e]"
          style={{ left: `${left}%`, top: `${[30, 48, 34, 68, 70][index]}%` }}
        />
      ))}
    </div>
  );
}

function ClosingScatterBand({ band }: { band: "top" | "bottom" }) {
  return (
    <div className="pointer-events-none relative min-h-24 w-full overflow-hidden sm:min-h-28 md:min-h-32">
      {closingDecorations.filter((item) => item.band === band).map((item, index) => (
        <motion.div
          key={item.label}
          className="absolute grid h-16 w-16 place-items-center rounded-md border border-white/10 bg-white/[0.035] sm:h-20 sm:w-20"
          style={{
            left: item.left,
            top: item.top,
            rotate: `${item.rotate}deg`
          }}
          initial={{ opacity: 0, scale: 0.78, rotate: -8 }}
          animate={{ opacity: 0.82, scale: 1, rotate: 0 }}
          transition={{ duration: 0.55, delay: item.delay + index * 0.02 }}
        >
          {item.kind === "shape" && item.Icon ? (
            <item.Icon className={`h-10 w-10 sm:h-14 sm:w-14 ${item.tone} opacity-80`} strokeWidth={1.7} />
          ) : (
            <CookieDisk />
          )}
        </motion.div>
      ))}
    </div>
  );
}

const closingConfetti = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  delay: (index % 8) * 0.08,
  duration: 1.5 + (index % 5) * 0.14,
  rotate: (index % 2 === 0 ? 1 : -1) * (120 + index * 11),
  color: ["bg-trauma", "bg-scrub", "bg-monitor", "bg-amber", "bg-white"][index % 5]
}));

function ClosingCongratulations() {
  return (
    <motion.div
      className="fixed inset-0 z-[245] grid place-items-center overflow-hidden bg-[#050607] px-4 text-center text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,176,32,0.2),transparent_34%),radial-gradient(circle_at_50%_72%,rgba(36,245,199,0.11),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {closingConfetti.map((piece) => (
          <motion.span
            key={piece.id}
            className={`absolute top-[-12%] h-4 w-2 rounded-sm ${piece.color}`}
            style={{ left: piece.left }}
            initial={{ y: "-10vh", opacity: 0, rotate: 0 }}
            animate={{ y: "118vh", opacity: [0, 1, 1, 0], rotate: piece.rotate }}
            transition={{ duration: piece.duration, delay: piece.delay, ease: "easeOut" }}
          />
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 1.02 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative grid justify-items-center gap-5"
      >
        <div className="grid h-20 w-20 place-items-center rounded-full border border-amber/35 bg-amber/10 text-amber shadow-[0_0_44px_rgba(255,176,32,0.22)]">
          <Sparkles className="h-10 w-10" />
        </div>
        <h2 className="font-display text-[clamp(4rem,12vw,11rem)] font-black uppercase leading-none text-white">Congratulations!</h2>
      </motion.div>
    </motion.div>
  );
}

export function buildMissedQuestionReport(room: RoomState | null) {
  if (!room) return { missed: [], csv: "", json: "[]" };

  const promptMap = new Map(
    stations.flatMap((station) => station.prompts.map((prompt) => [prompt.id, { station, prompt }] as const))
  );
  const playerMap = new Map(room.players.map((player) => [player.id, player]));
  const missed = Object.values(room.evaluations)
    .filter((evaluation) => evaluation.status !== "correct")
    .map((evaluation) => {
      const match = promptMap.get(evaluation.promptId);
      const player = evaluation.playerId ? playerMap.get(evaluation.playerId) : undefined;
      return {
        id: evaluation.promptId,
        station: match?.station.title ?? "Unknown station",
        question: match?.prompt.scenario ?? evaluation.promptId,
        answer: match?.prompt.expectedResponse ?? "No answer key available.",
        explanation: match?.prompt.explanation,
        status: evaluation.status,
        participant: player ? publicName(player.name) : "Group activity",
        shape: shapeLabel(player?.shape),
        evaluatedAt: evaluation.evaluatedAt
      };
    });

  const csvRows = [
    ["Station", "Question", "Status", "Participant", "Shape", "Evaluated At"],
    ...missed.map((item) => [item.station, item.question, item.status, item.participant, item.shape, item.evaluatedAt])
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = csvRows.map((row) => row.map(escape).join(",")).join("\n");
  const json = JSON.stringify({ roomCode: room.code, generatedAt: new Date().toISOString(), missedQuestions: missed }, null, 2);

  return { missed, csv, json };
}

function ParticipantAccuracy({ room }: { room: RoomState }) {
  const evaluations = Object.values(room.evaluations);
  const rows = room.players.map((player) => {
    const playerEvaluations = evaluations.filter((evaluation: PromptEvaluation) => evaluation.playerId === player.id);
    const correct = playerEvaluations.filter((evaluation) => evaluation.status === "correct").length;
    const partial = playerEvaluations.filter((evaluation) => evaluation.status === "partial").length;
    const incorrect = playerEvaluations.filter((evaluation) => evaluation.status === "incorrect").length;
    return {
      player,
      correct,
      partial,
      incorrect,
      total: playerEvaluations.length,
      accuracy: weightedAccuracy(correct, partial, playerEvaluations.length)
    };
  });

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <motion.div
          key={row.player.id}
          layout
          className="rounded-md border border-white/10 bg-white/[0.045] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-display text-lg font-black uppercase text-white">{publicName(row.player.name)}</div>
              <div className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-monitor">{shapeLabel(row.player.shape)}</div>
            </div>
            <div className={`font-display text-3xl font-black ${row.accuracy >= 80 ? "text-scrub" : row.accuracy >= 50 ? "text-amber" : "text-trauma"}`}>
              {row.accuracy}%
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${row.accuracy}%` }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="h-full rounded-full bg-scrub"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-md bg-black/30 p-2"><div className="text-[9px] uppercase text-white/35">Done</div><div className="font-display text-lg font-black">{row.total}</div></div>
            <div className="rounded-md bg-black/30 p-2"><div className="text-[9px] uppercase text-white/35">Right</div><div className="font-display text-lg font-black text-scrub">{row.correct}</div></div>
            <div className="rounded-md bg-black/30 p-2"><div className="text-[9px] uppercase text-white/35">Part</div><div className="font-display text-lg font-black text-amber">{row.partial}</div></div>
            <div className="rounded-md bg-black/30 p-2"><div className="text-[9px] uppercase text-white/35">Miss</div><div className="font-display text-lg font-black text-trauma">{row.incorrect}</div></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function SessionDebrief({
  room,
  role,
  audioEnabled = true,
  onDownload,
  onClosing,
  onEnd,
  onDebriefViewChange
}: {
  room: RoomState | null;
  role: "host" | "player";
  audioEnabled?: boolean;
  onDownload?: () => void;
  onClosing?: () => void;
  onEnd?: () => void;
  onDebriefViewChange?: (view: { promptId?: string | null; missedExpanded?: boolean }) => void;
}) {
  const debriefOpen = Boolean(room?.debriefStartedAt && !room.closingStartedAt);
  const closingOpen = Boolean(room?.closingStartedAt);
  const report = buildMissedQuestionReport(room);
  const focusedMiss = report.missed.find((item) => item.id === room?.debriefFocusedPromptId);
  const missedExpanded = Boolean(room?.debriefMissedExpanded);
  const [closingFinalVisible, setClosingFinalVisible] = useState(false);

  useEffect(() => {
    if (!audioEnabled || (!debriefOpen && !closingOpen)) {
      stopEndScreenTrack("theme");
      return;
    }

    playEndScreenTrack("theme", { loop: true, volume: debriefAudioVolume });

    return () => {
      if (debriefOpen || closingOpen) return;
      stopEndScreenTrack("theme");
    };
  }, [audioEnabled, closingOpen, debriefOpen]);

  useEffect(() => {
    if (!closingOpen || closingFinalVisible || !audioEnabled) return;

    const playAudio = () => {
      playEndScreenTrack("congratulations", { volume: closingCongratulationsAudioVolume });
    };
    playAudio();
    window.addEventListener("pointerdown", playAudio);
    window.addEventListener("keydown", playAudio);
    return () => {
      window.removeEventListener("pointerdown", playAudio);
      window.removeEventListener("keydown", playAudio);
      stopEndScreenTrack("congratulations");
    };
  }, [audioEnabled, closingFinalVisible, closingOpen]);

  useEffect(() => {
    if (!closingOpen) {
      setClosingFinalVisible(false);
      return;
    }
    setClosingFinalVisible(false);
    const timeout = window.setTimeout(() => setClosingFinalVisible(true), closingCongratulationsMs);
    return () => window.clearTimeout(timeout);
  }, [closingOpen]);

  return (
    <>
      <AnimatePresence>
        {debriefOpen && room ? (
          <motion.div
            className="fixed inset-0 z-[230] overflow-y-auto bg-[#07090b] text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:56px_56px]" />
            <div className="relative mx-auto grid min-h-screen max-w-7xl content-center gap-6 px-4 py-8">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-md border border-monitor/25 bg-black/50 p-5 md:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-xs font-black uppercase tracking-[0.26em] text-monitor">Competency debrief</div>
                    <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none md:text-6xl">Session Review</h2>
                    <p className="mt-3 max-w-3xl text-white/62">
                      {role === "host"
                        ? "Review missed items first, then close with participant accuracy. This screen stays live until you advance."
                        : "Review any missed items with your facilitator, then close with participant accuracy."}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                    <div className="font-display text-[10px] uppercase tracking-[0.18em] text-white/38">Missed</div>
                    <div className="font-display text-5xl font-black text-trauma">{report.missed.length}</div>
                  </div>
                </div>
              </motion.div>

              <div className={`grid gap-6 ${missedExpanded ? "xl:grid-cols-[1.55fr_0.45fr]" : "xl:grid-cols-[1.05fr_0.95fr]"}`}>
                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="rounded-md border border-white/10 bg-black/45 p-5"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Flag className="h-5 w-5 text-trauma" />
                      <h3 className="font-display text-2xl font-black uppercase">Missed Questions</h3>
                    </div>
                    {role === "host" && report.missed.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => onDebriefViewChange?.({ missedExpanded: !missedExpanded })}
                        className="rounded-md border border-monitor/25 bg-monitor/10 px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.16em] text-monitor transition hover:bg-monitor/15"
                      >
                        {missedExpanded ? "Compact" : "Expand"}
                      </button>
                    ) : null}
                  </div>
                  <div className="grid max-h-[52vh] gap-3 overflow-y-auto pr-1">
                    {report.missed.length === 0 ? (
                      <div className="rounded-md border border-scrub/25 bg-scrub/10 p-5">
                        <div className="font-display text-xl font-black uppercase text-scrub">No missed questions</div>
                        <p className="mt-2 text-white/62">Everything was marked correct.</p>
                      </div>
                    ) : (
                      report.missed.map((item, index) => (
                        <motion.button
                          type="button"
                          key={`${item.station}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.28, delay: 0.15 + index * 0.04 }}
                          onClick={() => role === "host" && onDebriefViewChange?.({ promptId: item.id })}
                          className={`rounded-md border p-4 text-left transition ${
                            focusedMiss?.id === item.id
                              ? "border-monitor/45 bg-monitor/10 shadow-[0_0_34px_rgba(110,247,255,0.1)]"
                              : "border-white/10 bg-white/[0.04]"
                          } ${role === "host" ? "hover:border-monitor/35" : ""}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-monitor">{item.station}</div>
                            <div className={`font-display text-[10px] font-black uppercase tracking-[0.16em] ${statusTone(item.status)}`}>{item.status}</div>
                          </div>
                          <p className="mt-2 text-lg font-semibold leading-7 text-white/85">{item.question}</p>
                          <div className="mt-3 text-xs text-white/45">{item.participant} / {item.shape}</div>
                        </motion.button>
                      ))
                    )}
                  </div>
                  {focusedMiss ? (
                    <motion.div
                      key={focusedMiss.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28 }}
                      className="mt-4 rounded-md border border-scrub/25 bg-scrub/10 p-5"
                    >
                      <div className="font-display text-xs font-black uppercase tracking-[0.18em] text-scrub">Correct answer</div>
                      <p className="mt-3 text-xl font-semibold leading-8 text-white/88">{focusedMiss.answer}</p>
                      {focusedMiss.explanation ? <p className="mt-3 text-sm leading-6 text-white/58">{focusedMiss.explanation}</p> : null}
                    </motion.div>
                  ) : null}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 }}
                  className="grid content-start gap-4"
                >
                  <div className="rounded-md border border-white/10 bg-black/45 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Medal className="h-5 w-5 text-scrub" />
                      <h3 className="font-display text-2xl font-black uppercase">Participant Accuracy</h3>
                    </div>
                    <ParticipantAccuracy room={room} />
                  </div>

                  {role === "host" ? (
                    <div className="rounded-md border border-amber/25 bg-amber/10 p-5">
                      <div className="font-display text-sm font-black uppercase tracking-[0.18em] text-amber">Evaluator controls</div>
                      <p className="mt-2 text-sm leading-6 text-white/62">
                        The missed-question report is available when you need it. Download it here or continue to closing when the review is complete.
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <AnimatedButton variant="ghost" onClick={onDownload}>
                          <Download className="h-4 w-4" />
                          Download report
                        </AnimatedButton>
                        <AnimatedButton variant="secondary" onClick={onClosing}>
                          <PartyPopper className="h-4 w-4" />
                          Closing
                        </AnimatedButton>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-monitor/20 bg-monitor/10 p-5 text-monitor">
                      Your facilitator will continue when the review is complete.
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {closingOpen ? (
          <motion.div
            className="fixed inset-0 z-[240] overflow-y-auto bg-[#050607] px-4 text-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!closingFinalVisible && <ClosingCongratulations />}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,176,32,0.12),transparent_34%),radial-gradient(circle_at_50%_75%,rgba(110,247,255,0.08),transparent_42%)]" />
            <div className="relative mx-auto grid min-h-screen max-w-6xl grid-rows-[auto_auto_auto] content-center gap-4 py-4">
              <ClosingScatterBand band="top" />
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.25 }}
                className="relative z-10 mx-auto max-w-4xl rounded-md border border-white/10 bg-black/70 p-8 shadow-[0_0_90px_rgba(255,48,77,0.18)] md:p-12"
              >
                <img
                  src="/images/new_favicon.png"
                  alt=""
                  className="mx-auto h-52 w-52 object-contain md:h-72 md:w-72"
                />
                <h2 className="mt-5 font-display text-5xl font-black uppercase leading-none md:text-7xl">Enjoy your Squid Game cookies!</h2>
                <div className="mx-auto mt-5 flex justify-center">
                  <motion.div animate={{ rotate: [0, -4, 4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                    <CookieDisk />
                  </motion.div>
                </div>
                {role === "host" && (
                  <div className="mx-auto mt-7 grid max-w-md gap-2 sm:grid-cols-2">
                    <AnimatedButton variant="ghost" onClick={onDownload}>
                      <Download className="h-4 w-4" />
                      Report
                    </AnimatedButton>
                    <AnimatedButton variant="secondary" onClick={onEnd}>
                      Finish
                    </AnimatedButton>
                  </div>
                )}
              </motion.div>
              <ClosingScatterBand band="bottom" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
