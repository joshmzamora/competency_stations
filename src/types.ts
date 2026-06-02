export type PromptType =
  | "activity"
  | "verbal-response"
  | "scenario-walkthrough"
  | "troubleshooting"
  | "practical-assessment"
  | "multiple-choice"
  | "timed-emergency";

export type ActivityColumn = {
  title: string;
  items: string[];
};

export type PromptActivity = {
  question: string;
  itemBankLabel: string;
  itemBank: string[];
  columns: ActivityColumn[];
};

export type CompetencyPrompt = {
  id: string;
  stationId: string;
  type: PromptType;
  title: string;
  scenario: string;
  instructions: string[];
  activity?: PromptActivity;
  answerKey?: ActivityColumn[];
  expectedResponse: string;
  explanation?: string;
  evaluationCriteria?: string[];
  criticalActions?: string[];
  notifyProviderWhen?: string[];
  timerSeconds?: number;
  choices?: string[];
};

export type PlayerPrompt = Omit<CompetencyPrompt, "expectedResponse" | "explanation" | "evaluationCriteria" | "criticalActions" | "notifyProviderWhen" | "choices" | "answerKey"> & {
  choices?: string[];
};

export type CompetencyStation = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  estimatedMinutes: number;
  competencyType: string;
  accent: "trauma" | "scrub" | "monitor" | "amber";
  prompts: CompetencyPrompt[];
};

export type PlayerStation = Omit<CompetencyStation, "prompts"> & {
  prompts: PlayerPrompt[];
};

export type EvaluationStatus = "correct" | "partial" | "incorrect";

export type PromptEvaluation = {
  promptId: string;
  playerId?: string;
  status: EvaluationStatus;
  note?: string;
  flagged: boolean;
  evaluatedAt: string;
};

export type ActivityState = {
  promptId: string;
  placements: Record<string, string | null>;
  checkCount: number;
  itemResults?: Record<string, boolean>;
  lastCheckedAt?: string;
};

export type ProtocolAnnouncement = {
  type: "assignment" | "selection" | "warning";
  title: string;
  subtitle: string;
  startedAt: number;
  durationMs: number;
};

export type SelectionState = {
  playerId: string;
  startedAt: number;
  durationMs: number;
};

export type PlayerShape = "triangle" | "star" | "umbrella" | "circle" | "square";

export type PlayerState = {
  id: string;
  name: string;
  connected: boolean;
  shape?: PlayerShape;
  turnCount: number;
};

export type ParticipantStats = {
  playerId: string;
  name: string;
  shape?: PlayerShape;
  turns: number;
  correct: number;
  partial: number;
  incorrect: number;
  accuracy: number;
};

export type GameStats = {
  answered: number;
  correct: number;
  partial: number;
  incorrect: number;
  scoreHistory: Array<{ at: string; score: number }>;
  missedPromptIds: string[];
  flaggedPromptIds: string[];
};

export type LiveAnswer = {
  playerId: string;
  answer: string;
  submittedAt: string;
  responseTimeMs?: number;
};

export type RoomState = {
  code: string;
  status: "lobby" | "in-progress" | "ended";
  serverTime: number;
  introStartedAt: number | null;
  introCompletedAt: number | null;
  protocolIntroStartedAt: number | null;
  patientReviewActiveFileId: string | null;
  patientReviewReviewedFileIds: string[];
  debriefStartedAt: number | null;
  debriefFocusedPromptId: string | null;
  debriefMissedExpanded: boolean;
  closingStartedAt: number | null;
  selection: SelectionState | null;
  currentParticipantId: string | null;
  sessionStartedAt: number | null;
  score: number;
  selectedStation: CompetencyStation | PlayerStation | null;
  stationRouteStartId: string | null;
  activePromptIndex: number;
  timerStartedAt: number | null;
  timerEndsAt: number | null;
  liveAnswer: LiveAnswer | null;
  players: PlayerState[];
  evaluations: Record<string, PromptEvaluation>;
  activityStates: Record<string, ActivityState>;
  createdAt: string;
  endedAt?: string;
  stats: GameStats;
};

export type ResultRecord = {
  id: string;
  roomCode?: string;
  createdAt: string;
  endedAt?: string;
  mode: "host-competency";
  score: number;
  answered: number;
  correct: number;
  partial: number;
  incorrect: number;
  accuracy: number;
  completionSeconds?: number;
  averageResponseMs?: number;
  stationBreakdown?: Record<string, { answered: number; correct: number; partial: number; incorrect: number; flagged: number }>;
  participantStats?: ParticipantStats[];
  missedPromptIds: string[];
  flaggedPromptIds: string[];
  scoreHistory: Array<{ at: string; score: number }>;
};

export type ClientMessage =
  | { type: "create-room" }
  | { type: "resume-host"; code: string }
  | { type: "join-room"; code: string; names: string[]; groupId?: string }
  | { type: "leave-room" }
  | { type: "start-session" }
  | { type: "start-session-now" }
  | { type: "skip-intro" }
  | { type: "skip-intro-to-patient-review"; elapsedMs: number }
  | { type: "review-patient-file"; fileId: string }
  | { type: "start-protocol-assignment" }
  | { type: "start-selection" }
  | { type: "override-selection"; playerId: string }
  | { type: "open-station"; station: CompetencyStation }
  | { type: "set-prompt-index"; index: number }
  | { type: "next-prompt" }
  | { type: "previous-prompt" }
  | { type: "start-timer"; seconds: number }
  | { type: "reset-timer" }
  | { type: "submit-answer"; answer: string; responseTimeMs?: number }
  | { type: "update-activity-card"; promptId: string; item: string; column: string | null }
  | { type: "check-activity"; promptId: string }
  | { type: "evaluate-prompt"; promptId: string; playerId?: string; status: EvaluationStatus; note?: string; flagged?: boolean }
  | { type: "adjust-score"; delta: number }
  | { type: "show-debrief" }
  | { type: "set-debrief-view"; promptId?: string | null; missedExpanded?: boolean }
  | { type: "show-closing" }
  | { type: "skip-protocol-assignment" }
  | { type: "finish-session" }
  | { type: "end-game"; promptIds?: string[] };

export type ServerMessage =
  | { type: "connected"; id: string }
  | { type: "room-created"; room: RoomState }
  | { type: "room-joined"; room: RoomState }
  | { type: "state"; room: RoomState }
  | { type: "room-left"; reason?: string }
  | { type: "session-finished" }
  | { type: "error"; message: string };
