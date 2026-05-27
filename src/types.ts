export type PromptType =
  | "verbal-response"
  | "scenario-walkthrough"
  | "troubleshooting"
  | "practical-assessment"
  | "multiple-choice"
  | "timed-emergency";

export type CompetencyPrompt = {
  id: string;
  stationId: string;
  type: PromptType;
  title: string;
  scenario: string;
  instructions: string[];
  expectedResponse: string;
  explanation: string;
  evaluationCriteria: string[];
  criticalActions?: string[];
  notifyProviderWhen?: string[];
  timerSeconds?: number;
  choices?: string[];
};

export type PlayerPrompt = Omit<CompetencyPrompt, "expectedResponse" | "explanation" | "evaluationCriteria" | "criticalActions" | "notifyProviderWhen" | "choices"> & {
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
  status: EvaluationStatus;
  note?: string;
  flagged: boolean;
  evaluatedAt: string;
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

export type PlayerShape = "circle" | "triangle" | "square" | "star" | "umbrella";

export type PlayerState = {
  id: string;
  name: string;
  connected: boolean;
  shape?: PlayerShape;
  turnCount: number;
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
  selection: SelectionState | null;
  score: number;
  selectedStation: CompetencyStation | PlayerStation | null;
  activePromptIndex: number;
  timerEndsAt: number | null;
  liveAnswer: LiveAnswer | null;
  players: PlayerState[];
  evaluations: Record<string, PromptEvaluation>;
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
  missedPromptIds: string[];
  flaggedPromptIds: string[];
  scoreHistory: Array<{ at: string; score: number }>;
};

export type ClientMessage =
  | { type: "create-room" }
  | { type: "join-room"; code: string; names: string[] }
  | { type: "start-session" }
  | { type: "skip-intro" }
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
  | { type: "evaluate-prompt"; promptId: string; status: EvaluationStatus; note?: string; flagged?: boolean }
  | { type: "adjust-score"; delta: number }
  | { type: "end-game" };

export type ServerMessage =
  | { type: "connected"; id: string }
  | { type: "room-created"; room: RoomState }
  | { type: "room-joined"; room: RoomState }
  | { type: "state"; room: RoomState }
  | { type: "error"; message: string };
