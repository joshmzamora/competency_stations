export type QuestionType = "multiple-choice" | "flashcard" | "short-answer";

export type Question = {
  id: string;
  category: string;
  points: number;
  type: QuestionType;
  prompt: string;
  choices?: string[];
  answer: string;
  explanation: string;
};

export type PlayerState = {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
};

export type GameStats = {
  answered: number;
  correct: number;
  incorrect: number;
  scoreHistory: Array<{ at: string; score: number }>;
  missedQuestionIds: string[];
};

export type FeedbackState = {
  questionId: string;
  correct: boolean;
  answer: string;
  explanation: string;
};

export type LiveAnswer = {
  playerId: string;
  answer: string;
  submittedAt: string;
  responseTimeMs?: number;
};

export type RoomState = {
  code: string;
  status: "lobby" | "playing" | "ended";
  score: number;
  selectedQuestion: Question | null;
  revealed: boolean;
  timerEndsAt: number | null;
  usedQuestionIds: string[];
  liveAnswer: LiveAnswer | null;
  feedback: FeedbackState | null;
  players: PlayerState[];
  createdAt: string;
  endedAt?: string;
  stats: GameStats;
};

export type ResultRecord = {
  id: string;
  roomCode?: string;
  createdAt: string;
  endedAt?: string;
  mode: "host-game" | "quick-quiz" | "study";
  score: number;
  answered: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  averageResponseMs?: number;
  categoryBreakdown?: Record<string, { answered: number; correct: number; missed: number }>;
  missedQuestionIds: string[];
  scoreHistory: Array<{ at: string; score: number }>;
};

export type ClientMessage =
  | { type: "create-room" }
  | { type: "join-room"; code: string; name: string }
  | { type: "player-ready"; ready: boolean }
  | { type: "start-session" }
  | { type: "select-question"; question: Question }
  | { type: "reveal-answer" }
  | { type: "start-timer"; seconds: number }
  | { type: "submit-answer"; answer: string; responseTimeMs?: number }
  | { type: "mark-answer"; correct: boolean }
  | { type: "adjust-score"; delta: number }
  | { type: "end-game" };

export type ServerMessage =
  | { type: "connected"; id: string }
  | { type: "room-created"; room: RoomState }
  | { type: "room-joined"; room: RoomState }
  | { type: "state"; room: RoomState }
  | { type: "error"; message: string };
