import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import type { ViteDevServer } from "vite";

type ClientRole = "host" | "player";
type EvaluationStatus = "correct" | "partial" | "incorrect";

type WireMessage = {
  type: string;
  [key: string]: unknown;
};

type PlayerState = {
  id: string;
  name: string;
  connected: boolean;
  shape?: string;
  turnCount: number;
};

type PromptEvaluation = {
  promptId: string;
  playerId?: string;
  status: EvaluationStatus;
  note?: string;
  flagged: boolean;
  evaluatedAt: string;
};

type ActivityState = {
  promptId: string;
  placements: Record<string, string | null>;
  checkCount: number;
  itemResults?: Record<string, boolean>;
  lastCheckedAt?: string;
};

type GameStats = {
  answered: number;
  correct: number;
  partial: number;
  incorrect: number;
  scoreHistory: Array<{ at: string; score: number }>;
  missedPromptIds: string[];
  flaggedPromptIds: string[];
};

type RoomState = {
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
  selection: { playerId: string; startedAt: number; durationMs: number } | null;
  currentParticipantId: string | null;
  sessionStartedAt: number | null;
  score: number;
  selectedStation: unknown | null;
  stationRouteStartId: string | null;
  activePromptIndex: number;
  timerEndsAt: number | null;
  timerStartedAt: number | null;
  liveAnswer: { playerId: string; answer: string; submittedAt: string; responseTimeMs?: number } | null;
  players: PlayerState[];
  evaluations: Record<string, PromptEvaluation>;
  activityStates: Record<string, ActivityState>;
  createdAt: string;
  endedAt?: string;
  stats: GameStats;
};

type WsClient = {
  id: string;
  socket: net.Socket;
  buffer: Buffer;
  messageFragments: Buffer[];
  fragmentedOpcode: number | null;
  role?: ClientRole;
  roomCode?: string;
  names?: string[];
  groupId?: string;
  connected: boolean;
};

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(rootDir, "data");
const resultsPath = path.join(dataDir, "results.json");
const roomsPath = path.join(dataDir, "rooms.json");
const port = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === "production";

const clients = new Set<WsClient>();
const rooms = new Map<string, RoomState>();
let roomsSaveTimer: NodeJS.Timeout | null = null;
const websocketHeartbeatMs = 15000;
const minParticipants = 2;
const maxParticipants = 7;

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function normalizeRoomCode(value: unknown) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function createInitialRoom(code: string): RoomState {
  const now = new Date().toISOString();
  return {
    code,
    status: "lobby",
    serverTime: Date.now(),
    introStartedAt: null,
    introCompletedAt: null,
    protocolIntroStartedAt: null,
    patientReviewActiveFileId: null,
    patientReviewReviewedFileIds: [],
    debriefStartedAt: null,
    debriefFocusedPromptId: null,
    debriefMissedExpanded: false,
    closingStartedAt: null,
    selection: null,
    currentParticipantId: null,
    sessionStartedAt: null,
    score: 0,
    selectedStation: null,
    stationRouteStartId: null,
    activePromptIndex: 0,
    timerEndsAt: null,
    timerStartedAt: null,
    liveAnswer: null,
    players: [],
    evaluations: {},
    activityStates: {},
    createdAt: now,
    stats: {
      answered: 0,
      correct: 0,
      partial: 0,
      incorrect: 0,
      scoreHistory: [{ at: now, score: 0 }],
      missedPromptIds: [],
      flaggedPromptIds: []
    }
  };
}

function objectField(value: unknown, field: string) {
  if (value && typeof value === "object" && field in value) {
    return (value as Record<string, unknown>)[field];
  }
  return undefined;
}

function stationPrompts(station: unknown): unknown[] {
  const prompts = objectField(station, "prompts");
  return Array.isArray(prompts) ? prompts : [];
}

function activePrompt(room: RoomState) {
  return stationPrompts(room.selectedStation)[room.activePromptIndex] ?? null;
}

function promptId(prompt: unknown) {
  return String(objectField(prompt, "id") ?? "");
}

function activeQuestionIsEvaluated(room: RoomState) {
  const id = promptId(activePrompt(room));
  return Boolean(!id || room.evaluations[id]);
}

function restoreParticipantForActivePrompt(room: RoomState) {
  const id = promptId(activePrompt(room));
  room.selection = null;
  room.currentParticipantId = id ? room.evaluations[id]?.playerId ?? null : null;
}

function selectedStationId(room: RoomState) {
  return String(objectField(room.selectedStation, "id") ?? "");
}

function usesParticipantSelection(room: RoomState) {
  const type = String(objectField(activePrompt(room), "type") ?? "");
  return type !== "activity" && type !== "group-response";
}

function findPrompt(room: RoomState, id: string) {
  return stationPrompts(room.selectedStation).find((prompt) => promptId(prompt) === id) ?? null;
}

function activityItems(prompt: unknown): string[] {
  const activity = objectField(prompt, "activity");
  const itemBank = objectField(activity, "itemBank");
  return Array.isArray(itemBank) ? itemBank.map((item) => String(item)) : [];
}

function ensureActivityState(room: RoomState, prompt: unknown): ActivityState | null {
  const id = promptId(prompt);
  if (!id) return null;
  if (!room.activityStates[id]) {
    room.activityStates[id] = {
      promptId: id,
      placements: Object.fromEntries(activityItems(prompt).map((item) => [item, null])),
      checkCount: 0
    };
  }
  return room.activityStates[id];
}

function answerMap(prompt: unknown): Map<string, string> {
  const answerKey = objectField(prompt, "answerKey");
  const map = new Map<string, string>();
  if (!Array.isArray(answerKey)) return map;
  for (const column of answerKey) {
    const title = String(objectField(column, "title") ?? "");
    const items = objectField(column, "items");
    if (!title || !Array.isArray(items)) continue;
    for (const item of items) {
      map.set(String(item), title);
    }
  }
  return map;
}

function statusPoints(status: EvaluationStatus) {
  if (status === "correct") return 100;
  if (status === "partial") return 50;
  return 0;
}

function recalculateStats(room: RoomState) {
  const evaluations = Object.values(room.evaluations);
  room.stats.answered = evaluations.length;
  room.stats.correct = evaluations.filter((item) => item.status === "correct").length;
  room.stats.partial = evaluations.filter((item) => item.status === "partial").length;
  room.stats.incorrect = evaluations.filter((item) => item.status === "incorrect").length;
  room.stats.missedPromptIds = evaluations.filter((item) => item.status !== "correct").map((item) => item.promptId);
  room.stats.flaggedPromptIds = evaluations.filter((item) => item.flagged).map((item) => item.promptId);
  room.score = evaluations.reduce((sum, item) => sum + statusPoints(item.status), 0);
}

function sanitizePrompt(prompt: unknown) {
  if (!prompt || typeof prompt !== "object") return prompt;
  const {
    expectedResponse: _expectedResponse,
    explanation: _explanation,
    evaluationCriteria: _evaluationCriteria,
    criticalActions: _criticalActions,
    notifyProviderWhen: _notifyProviderWhen,
    answerKey: _answerKey,
    ...safePrompt
  } = prompt as Record<string, unknown>;
  return safePrompt;
}

function sanitizeStation(station: unknown) {
  if (!station || typeof station !== "object") return station;
  return {
    ...(station as Record<string, unknown>),
    prompts: stationPrompts(station).map(sanitizePrompt)
  };
}

function connectedPlayers(roomCode: string): PlayerState[] {
  const room = rooms.get(roomCode);
  if (!room) return [];

  const connectedIds = new Set<string>();
  for (const client of clients) {
    if (client.roomCode === roomCode && client.role === "player") {
      const names = client.names ?? [];
      names.forEach((_, index) => {
        connectedIds.add(`${client.groupId ?? client.id}-${index}`);
      });
    }
  }

  return room.players.map(player => ({
    ...player,
    connected: connectedIds.has(player.id)
  }));
}

function connectedPlayerClients(roomCode: string) {
  return [...clients].filter((client) => client.roomCode === roomCode && client.role === "player" && client.connected);
}

function connectedHostClients(roomCode: string) {
  return [...clients].filter((client) => client.roomCode === roomCode && client.role === "host" && client.connected);
}

function recordValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function recordMap(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, never> : {};
}

function restoreRoomSnapshot(value: unknown, code: string): RoomState | null {
  const snapshot = recordValue(value);
  if (normalizeRoomCode(snapshot.code) !== code) return null;
  if (snapshot.status !== "lobby" && snapshot.status !== "in-progress" && snapshot.status !== "ended") return null;

  const base = createInitialRoom(code);
  const restored: RoomState = {
    ...base,
    code,
    status: snapshot.status,
    serverTime: Date.now(),
    introStartedAt: null,
    introCompletedAt: numberOrNull(snapshot.introCompletedAt),
    protocolIntroStartedAt: null,
    patientReviewActiveFileId: typeof snapshot.patientReviewActiveFileId === "string" ? snapshot.patientReviewActiveFileId : null,
    patientReviewReviewedFileIds: Array.isArray(snapshot.patientReviewReviewedFileIds) ? snapshot.patientReviewReviewedFileIds.map((item) => String(item)) : [],
    debriefStartedAt: numberOrNull(snapshot.debriefStartedAt),
    debriefFocusedPromptId: typeof snapshot.debriefFocusedPromptId === "string" ? snapshot.debriefFocusedPromptId : null,
    debriefMissedExpanded: Boolean(snapshot.debriefMissedExpanded),
    closingStartedAt: numberOrNull(snapshot.closingStartedAt),
    selection: null,
    currentParticipantId: typeof snapshot.currentParticipantId === "string" ? snapshot.currentParticipantId : null,
    sessionStartedAt: numberOrNull(snapshot.sessionStartedAt),
    score: typeof snapshot.score === "number" && Number.isFinite(snapshot.score) ? snapshot.score : 0,
    selectedStation: snapshot.selectedStation && typeof snapshot.selectedStation === "object" ? snapshot.selectedStation : null,
    stationRouteStartId: typeof snapshot.stationRouteStartId === "string" ? snapshot.stationRouteStartId : null,
    activePromptIndex: typeof snapshot.activePromptIndex === "number" && Number.isFinite(snapshot.activePromptIndex) ? Math.max(0, Math.floor(snapshot.activePromptIndex)) : 0,
    timerEndsAt: typeof snapshot.timerEndsAt === "number" && snapshot.timerEndsAt > Date.now() ? snapshot.timerEndsAt : null,
    timerStartedAt: numberOrNull(snapshot.timerStartedAt),
    liveAnswer: snapshot.liveAnswer && typeof snapshot.liveAnswer === "object" ? snapshot.liveAnswer as RoomState["liveAnswer"] : null,
    players: Array.isArray(snapshot.players)
      ? snapshot.players.map((entry, index) => {
        const player = recordValue(entry);
        return {
          id: typeof player.id === "string" ? player.id : `restored-${index}`,
          name: typeof player.name === "string" ? player.name : `Player ${index + 1}`,
          connected: false,
          shape: typeof player.shape === "string" ? player.shape : undefined,
          turnCount: typeof player.turnCount === "number" && Number.isFinite(player.turnCount) ? player.turnCount : 0
        };
      })
      : [],
    evaluations: recordMap(snapshot.evaluations) as Record<string, PromptEvaluation>,
    activityStates: recordMap(snapshot.activityStates) as Record<string, ActivityState>,
    createdAt: typeof snapshot.createdAt === "string" ? snapshot.createdAt : base.createdAt,
    endedAt: typeof snapshot.endedAt === "string" ? snapshot.endedAt : undefined,
    stats: snapshot.stats && typeof snapshot.stats === "object" ? snapshot.stats as GameStats : base.stats
  };

  recalculateStats(restored);
  return restored;
}

function detachPlayerClient(client: WsClient, reason?: string, removeSavedParticipants = false) {
  const roomCode = client.roomCode;
  const groupId = client.groupId;
  const room = roomCode ? rooms.get(roomCode) : null;

  if (room && groupId && removeSavedParticipants) {
    room.players = room.players.filter((player) => !player.id.startsWith(`${groupId}-`));
    if (room.currentParticipantId?.startsWith(`${groupId}-`)) {
      room.currentParticipantId = null;
      room.selection = null;
    }
    recalculateStats(room);
  }

  client.role = undefined;
  client.roomCode = undefined;
  client.names = undefined;
  client.groupId = undefined;
  send(client, { type: "room-left", reason });

  if (roomCode) {
    scheduleRoomsSave();
    broadcastState(roomCode);
  }
}

function detachCurrentRoom(client: WsClient, reason?: string, removeSavedParticipants = false, notify = false) {
  const roomCode = client.roomCode;
  const groupId = client.groupId;
  const room = roomCode ? rooms.get(roomCode) : null;

  if (room && groupId && removeSavedParticipants) {
    room.players = room.players.filter((player) => !player.id.startsWith(`${groupId}-`));
    if (room.currentParticipantId?.startsWith(`${groupId}-`)) {
      room.currentParticipantId = null;
      room.selection = null;
    }
    recalculateStats(room);
  }

  client.role = undefined;
  client.roomCode = undefined;
  client.names = undefined;
  client.groupId = undefined;

  if (notify) {
    send(client, { type: "room-left", reason });
  }

  if (roomCode) {
    scheduleRoomsSave();
    broadcastState(roomCode);
  }
}

function pickBalancedPlayer(room: RoomState): string | null {
  const players = room.players.filter(p => connectedPlayers(room.code).find(cp => cp.id === p.id && cp.connected));
  if (players.length === 0) return null;

  // Find minimum turn count
  const minTurns = Math.min(...players.map(p => p.turnCount));

  // Players who haven't had a turn or have the lowest turns
  let candidates = players.filter(p => p.turnCount === minTurns);
  if (candidates.length > 1 && room.currentParticipantId) {
    candidates = candidates.filter((player) => player.id !== room.currentParticipantId);
  }

  // Randomly pick from the fairest candidates
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  return selected.id;
}

function startSelection(room: RoomState, durationMs = 1700, holdMs = 1800) {
  if (room.status !== "in-progress") return false;
  if (!usesParticipantSelection(room)) {
    room.selection = null;
    room.currentParticipantId = null;
    return false;
  }
  if (!room.players.some((player) => player.shape)) {
    assignShapesToRoom(room);
  }
  if (!room.players.some((player) => player.shape)) return false;

  const playerId = pickBalancedPlayer(room);
  if (!playerId) return false;

  const selectionStartedAt = Math.max(Date.now(), (room.selection?.startedAt ?? 0) + 1);
  room.selection = {
    playerId,
    startedAt: selectionStartedAt,
    durationMs
  };
  room.currentParticipantId = playerId;

  const player = room.players.find(p => p.id === playerId);
  if (player) player.turnCount++;

  setTimeout(() => {
    if (room.selection?.startedAt === selectionStartedAt) {
      room.selection = null;
      broadcastState(room.code);
    }
  }, durationMs + holdMs);

  return true;
}

function assignShapesToRoom(room: RoomState) {
  const priorityShapes = ["triangle", "star", "umbrella", "circle", "square", "diamond", "hexagon"];
  const shapes = priorityShapes.slice(0, Math.max(0, Math.min(room.players.length, priorityShapes.length)));

  // Shuffle the shape pool so assignments stay random while keeping each participant visually distinct.
  for (let i = shapes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shapes[i], shapes[j]] = [shapes[j], shapes[i]];
  }

  room.players = room.players.map((player, index) => ({
    ...player,
    shape: shapes[index % shapes.length],
    turnCount: 0 // Reset counts when new assignments happen
  }));
}

function publicRoom(room: RoomState, role: ClientRole | undefined): RoomState {
  return {
    ...room,
    serverTime: Date.now(),
    players: connectedPlayers(room.code),
    selectedStation: role === "player" ? sanitizeStation(room.selectedStation) : room.selectedStation
  };
}

function participantStats(room: RoomState) {
  const evaluations = Object.values(room.evaluations);
  return room.players.map((player) => {
    const playerEvaluations = evaluations.filter((evaluation) => evaluation.playerId === player.id);
    const correct = playerEvaluations.filter((evaluation) => evaluation.status === "correct").length;
    const partial = playerEvaluations.filter((evaluation) => evaluation.status === "partial").length;
    const incorrect = playerEvaluations.filter((evaluation) => evaluation.status === "incorrect").length;
    const weighted = correct * 100 + partial * 50;
    return {
      playerId: player.id,
      name: player.name,
      shape: player.shape,
      turns: player.turnCount,
      correct,
      partial,
      incorrect,
      accuracy: playerEvaluations.length ? Math.round(weighted / playerEvaluations.length) : 0
    };
  });
}

function send(client: WsClient, message: WireMessage) {
  if (!client.connected || client.socket.destroyed) return;
  const json = Buffer.from(JSON.stringify(message), "utf8");
  let header: Buffer;

  if (json.length < 126) {
    header = Buffer.from([0x81, json.length]);
  } else if (json.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(json.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(json.length), 2);
  }

  try {
    client.socket.write(Buffer.concat([header, json]));
  } catch {
    removeClient(client);
  }
}

function sendError(client: WsClient, message: string) {
  send(client, { type: "error", message });
}

function sendState(client: WsClient, room: RoomState, type: "state" | "room-created" | "room-joined" = "state") {
  send(client, { type, room: publicRoom(room, client.role) });
}

function broadcastState(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;
  scheduleRoomsSave();
  for (const client of clients) {
    if (client.roomCode === roomCode) sendState(client, room);
  }
}

function finishRoomSession(room: RoomState) {
  const roomCode = room.code;
  room.status = "ended";
  room.endedAt = room.endedAt ?? new Date().toISOString();
  room.selection = null;
  room.currentParticipantId = null;
  room.timerEndsAt = null;
  recalculateStats(room);

  for (const client of clients) {
    if (client.roomCode === roomCode) {
      send(client, { type: "session-finished" });
      client.role = undefined;
      client.roomCode = undefined;
      client.names = undefined;
      client.groupId = undefined;
    }
  }

  rooms.delete(roomCode);
  scheduleRoomsSave();
}

async function ensureResultsFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(resultsPath);
  } catch {
    await fs.writeFile(resultsPath, "[]\n", "utf8");
  }
}

async function readResults() {
  await ensureResultsFile();
  const file = await fs.readFile(resultsPath, "utf8");
  try {
    return JSON.parse(file) as unknown[];
  } catch {
    return [];
  }
}

async function appendResult(result: unknown) {
  const results = await readResults();
  results.push(result);
  await fs.writeFile(resultsPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
}

function serializableRoom(room: RoomState): RoomState {
  return {
    ...room,
    serverTime: Date.now(),
    introStartedAt: null,
    protocolIntroStartedAt: null,
    patientReviewActiveFileId: room.patientReviewActiveFileId ?? null,
    patientReviewReviewedFileIds: Array.isArray(room.patientReviewReviewedFileIds) ? room.patientReviewReviewedFileIds : [],
    debriefFocusedPromptId: room.debriefFocusedPromptId ?? null,
    debriefMissedExpanded: Boolean(room.debriefMissedExpanded),
    selection: null,
    timerEndsAt: room.timerEndsAt && room.timerEndsAt > Date.now() ? room.timerEndsAt : null,
    players: room.players.map((player) => ({ ...player, connected: false }))
  };
}

async function saveRoomsNow() {
  await fs.mkdir(dataDir, { recursive: true });
  const payload = [...rooms.values()].map(serializableRoom);
  const tempPath = `${roomsPath}.${process.pid}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, roomsPath);
}

function scheduleRoomsSave() {
  if (roomsSaveTimer) clearTimeout(roomsSaveTimer);
  roomsSaveTimer = setTimeout(() => {
    roomsSaveTimer = null;
    saveRoomsNow().catch((error) => {
      console.error("Could not save active room progress", error);
    });
  }, 120);
}

async function flushRoomsSave() {
  if (roomsSaveTimer) {
    clearTimeout(roomsSaveTimer);
    roomsSaveTimer = null;
  }
  await saveRoomsNow();
}

async function loadRooms() {
  try {
    const file = await fs.readFile(roomsPath, "utf8");
    const savedRooms = JSON.parse(file) as unknown;
    if (!Array.isArray(savedRooms)) return;
    for (const item of savedRooms) {
      if (!item || typeof item !== "object") continue;
      const room = item as RoomState;
      if (!room.code) continue;
      rooms.set(room.code, {
        ...room,
        serverTime: Date.now(),
        introStartedAt: null,
        protocolIntroStartedAt: null,
        patientReviewActiveFileId: room.patientReviewActiveFileId ?? null,
        patientReviewReviewedFileIds: Array.isArray(room.patientReviewReviewedFileIds) ? room.patientReviewReviewedFileIds : [],
        debriefFocusedPromptId: room.debriefFocusedPromptId ?? null,
        debriefMissedExpanded: Boolean(room.debriefMissedExpanded),
        selection: null,
        timerEndsAt: room.timerEndsAt && room.timerEndsAt > Date.now() ? room.timerEndsAt : null,
        players: Array.isArray(room.players) ? room.players.map((player) => ({ ...player, connected: false })) : [],
        evaluations: room.evaluations ?? {},
        activityStates: room.activityStates ?? {},
        stats: room.stats ?? createInitialRoom(room.code).stats
      });
    }
  } catch {
    // No active-room progress has been saved yet.
  }
}

async function saveRoomResult(room: RoomState) {
  const prompts = stationPrompts(room.selectedStation);
  const stationTitle = String(objectField(room.selectedStation, "title") ?? "Competency Station");
  const completionSeconds = Math.max(0, Math.round((Date.parse(room.endedAt ?? new Date().toISOString()) - Date.parse(room.createdAt)) / 1000));
  await appendResult({
    id: crypto.randomUUID(),
    roomCode: room.code,
    mode: "host-competency",
    stationTitle,
    createdAt: room.createdAt,
    endedAt: room.endedAt ?? new Date().toISOString(),
    score: room.score,
    answered: room.stats.answered,
    correct: room.stats.correct,
    partial: room.stats.partial,
    incorrect: room.stats.incorrect,
    accuracy: prompts.length ? Math.round((room.score / (prompts.length * 100)) * 100) : 0,
    completionSeconds,
    participantStats: participantStats(room),
    missedPromptIds: room.stats.missedPromptIds,
    flaggedPromptIds: room.stats.flaggedPromptIds,
    scoreHistory: room.stats.scoreHistory
  });
}

function parseFrames(client: WsClient, chunk: Buffer) {
  client.buffer = Buffer.concat([client.buffer, chunk]);

  while (client.buffer.length >= 2) {
    const firstByte = client.buffer[0];
    const secondByte = client.buffer[1];
    const fin = (firstByte & 0x80) === 0x80;
    const opcode = firstByte & 0x0f;
    const masked = (secondByte & 0x80) === 0x80;
    let payloadLength = secondByte & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      if (client.buffer.length < offset + 2) return;
      payloadLength = client.buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      if (client.buffer.length < offset + 8) return;
      const longLength = client.buffer.readBigUInt64BE(offset);
      if (longLength > BigInt(Number.MAX_SAFE_INTEGER)) {
        client.socket.destroy();
        return;
      }
      payloadLength = Number(longLength);
      offset += 8;
    }

    const maskLength = masked ? 4 : 0;
    if (client.buffer.length < offset + maskLength + payloadLength) return;

    const mask = masked ? client.buffer.subarray(offset, offset + 4) : null;
    offset += maskLength;
    const payload = Buffer.from(client.buffer.subarray(offset, offset + payloadLength));
    client.buffer = client.buffer.subarray(offset + payloadLength);

    if (mask) {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] ^= mask[index % 4];
      }
    }

    if (opcode === 0x8) {
      client.socket.end();
      return;
    }

    if (opcode === 0x9) {
      client.socket.write(Buffer.from([0x8a, 0x00]));
      continue;
    }

    if (opcode === 0x0) {
      if (client.fragmentedOpcode === null) {
        client.socket.destroy();
        return;
      }
      client.messageFragments.push(payload);
      if (!fin) continue;
      const messagePayload = Buffer.concat(client.messageFragments);
      client.messageFragments = [];
      client.fragmentedOpcode = null;
      if (messagePayload.length > 1024 * 1024) {
        sendError(client, "The server received a message that was too large.");
        continue;
      }
      try {
        handleSocketMessage(client, JSON.parse(messagePayload.toString("utf8")) as WireMessage);
      } catch (error) {
        console.error("WebSocket message handling failed:", error);
        sendError(client, "The server received a message it could not understand.");
      }
      continue;
    }

    if (opcode !== 0x1) continue;

    if (!fin) {
      client.fragmentedOpcode = opcode;
      client.messageFragments = [payload];
      continue;
    }

    try {
      handleSocketMessage(client, JSON.parse(payload.toString("utf8")) as WireMessage);
    } catch (error) {
      console.error("WebSocket message handling failed:", error);
      sendError(client, "The server received a message it could not understand.");
    }
  }
}

function movePrompt(room: RoomState, nextIndex: number) {
  const prompts = stationPrompts(room.selectedStation);
  if (!prompts.length) return false;
  const previousIndex = room.activePromptIndex;
  room.activePromptIndex = Math.max(0, Math.min(prompts.length - 1, nextIndex));
  room.liveAnswer = null;
  room.timerEndsAt = null;
  return previousIndex !== room.activePromptIndex;
}

function evaluatePrompt(room: RoomState, message: WireMessage) {
  const id = String(message.promptId ?? promptId(activePrompt(room)));
  if (!id) return;

  const status = message.status === "correct" || message.status === "partial" || message.status === "incorrect" ? message.status : "incorrect";
  room.evaluations[id] = {
    promptId: id,
    playerId: typeof message.playerId === "string" ? message.playerId : room.currentParticipantId ?? undefined,
    status,
    note: typeof message.note === "string" ? message.note.slice(0, 500) : undefined,
    flagged: Boolean(message.flagged),
    evaluatedAt: new Date().toISOString()
  };
  recalculateStats(room);
  room.stats.scoreHistory.push({ at: new Date().toISOString(), score: room.score });
}

function markMissingPromptsIncorrect(room: RoomState, promptIds: unknown) {
  if (!Array.isArray(promptIds)) return;
  const now = new Date().toISOString();
  for (const value of promptIds) {
    const id = String(value ?? "");
    if (!id || room.evaluations[id]) continue;
    room.evaluations[id] = {
      promptId: id,
      status: "incorrect",
      flagged: false,
      evaluatedAt: now
    };
  }
  recalculateStats(room);
}

function handleSocketMessage(client: WsClient, message: WireMessage) {
  if (message.type === "client-heartbeat") {
    send(client, { type: "heartbeat", serverTime: Date.now() });
    return;
  }

  if (message.type === "create-room") {
    if (client.roomCode) {
      detachCurrentRoom(client, undefined, client.role === "player", false);
    }
    const code = createRoomCode();
    const room = createInitialRoom(code);
    rooms.set(code, room);
    scheduleRoomsSave();
    client.role = "host";
    client.roomCode = code;
    sendState(client, room, "room-created");
    return;
  }

  if (message.type === "resume-host") {
    const code = normalizeRoomCode(message.code);
    let room = rooms.get(code);
    if (!room) {
      const restoredRoom = restoreRoomSnapshot(message.room, code);
      if (!restoredRoom) {
        sendError(client, "Previous host room was not found. Create a new room on this computer.");
        return;
      }
      room = restoredRoom;
      rooms.set(code, room);
      flushRoomsSave().catch((error) => {
        console.error("Could not save restored room", error);
      });
    }

    if (client.roomCode && client.roomCode !== code) {
      detachCurrentRoom(client, undefined, client.role === "player", false);
    }

    for (const existingHost of connectedHostClients(code)) {
      if (existingHost.id !== client.id) {
        detachCurrentRoom(existingHost, "Host control moved to another browser window.", false, true);
      }
    }

    client.role = "host";
    client.roomCode = code;
    client.names = undefined;
    client.groupId = undefined;
    sendState(client, room, "room-created");
    broadcastState(code);
    return;
  }

  if (message.type === "join-room") {
    const code = normalizeRoomCode(message.code);
    const room = rooms.get(code);
    if (!room) {
      sendError(client, "Room not found. Check the code on the host screen.");
      return;
    }

    const groupId = String(message.groupId ?? client.groupId ?? client.id).trim().slice(0, 80) || client.id;
    const existingPlayerClients = connectedPlayerClients(code);
    const reconnectingSameLearner = existingPlayerClients.some((existingClient) => existingClient.groupId === groupId);
    const currentClientAlreadyInRoom = existingPlayerClients.some((existingClient) => existingClient.id === client.id);
    const otherLearnerConnected = existingPlayerClients.some((existingClient) => existingClient.id !== client.id && existingClient.groupId !== groupId);
    if (otherLearnerConnected || (existingPlayerClients.length >= 1 && !currentClientAlreadyInRoom && !reconnectingSameLearner)) {
      sendError(client, `A learner screen is already connected. This simulation supports one player computer with ${minParticipants}-${maxParticipants} participants.`);
      return;
    }

    const savedGroupPlayers = room.players
      .filter((player) => player.id.startsWith(`${groupId}-`))
      .sort((a, b) => Number(a.id.split("-").at(-1) ?? 0) - Number(b.id.split("-").at(-1) ?? 0));
    const savedGroupNames = savedGroupPlayers.map((player) => {
      const match = player.name.match(/\((.*)\)/);
      return match?.[1] || player.name.replace(/^Player\s+\d+\s*/i, "").trim();
    }).filter(Boolean);
    const rawNames = Array.isArray(message.names) && message.names.length > 0
      ? message.names
      : savedGroupNames.length > 0
        ? savedGroupNames
        : [String(message.name ?? "Player")];
    const names = rawNames
      .map((n) => String(n).trim().slice(0, 24))
      .filter(Boolean)
      .slice(0, maxParticipants);

    if (names.length < minParticipants) {
      sendError(client, `Enter at least ${minParticipants} participant names on the learner screen before joining.`);
      return;
    }

    if (client.roomCode && client.roomCode !== code) {
      detachCurrentRoom(client, undefined, client.role === "player", false);
    }

    for (const existingClient of connectedPlayerClients(code)) {
      if (existingClient.id !== client.id && existingClient.groupId === groupId) {
        detachPlayerClient(existingClient, "This learner screen reconnected in another browser window.");
      }
    }

    client.role = "player";
    client.roomCode = code;
    client.names = names;
    client.groupId = groupId;

    const existingPlayers = new Map(room.players.map((player) => [player.id, player]));

    // Create player states with formatted names.
    room.players = names.map((n, i) => ({
      id: `${groupId}-${i}`,
      name: `Player ${i + 1} (${n})`,
      connected: true,
      shape: existingPlayers.get(`${groupId}-${i}`)?.shape,
      turnCount: existingPlayers.get(`${groupId}-${i}`)?.turnCount ?? 0
    }));

    sendState(client, room, "room-joined");
    broadcastState(code);
    return;
  }

  if (!client.roomCode) {
    sendError(client, "Join or create a room first.");
    return;
  }

  const room = rooms.get(client.roomCode);
  if (!room) {
    sendError(client, "This room no longer exists.");
    return;
  }

  switch (message.type) {
    case "leave-room": {
      if (client.role === "player") {
        detachPlayerClient(client, "You left the room.", true);
      } else if (client.role === "host") {
        client.role = undefined;
        client.roomCode = undefined;
        client.names = undefined;
        client.groupId = undefined;
        send(client, { type: "room-left", reason: "Host left the room." });
        scheduleRoomsSave();
        broadcastState(room.code);
      }
      break;
    }
    case "start-session": {
      if (client.role !== "host") return;
      const playerConnections = connectedPlayerClients(room.code);
      const connectedParticipantCount = connectedPlayers(room.code).filter((player) => player.connected).length;
      if (playerConnections.length !== 1 || connectedParticipantCount < minParticipants || connectedParticipantCount > maxParticipants) {
        sendError(client, `Connect exactly one learner screen with ${minParticipants}-${maxParticipants} participants before starting the session.`);
        return;
      }
      room.status = "in-progress";
      room.sessionStartedAt = room.sessionStartedAt ?? Date.now();
      room.introStartedAt = room.introCompletedAt ? null : Date.now();
      room.protocolIntroStartedAt = null;
      room.patientReviewActiveFileId = "identity";
      room.patientReviewReviewedFileIds = ["identity"];
      room.selection = null;
      room.debriefStartedAt = null;
      room.closingStartedAt = null;
      broadcastState(room.code);
      break;
    }
    case "start-session-now": {
      if (client.role !== "host") return;
      const playerConnections = connectedPlayerClients(room.code);
      const connectedParticipantCount = connectedPlayers(room.code).filter((player) => player.connected).length;
      if (playerConnections.length !== 1 || connectedParticipantCount < minParticipants || connectedParticipantCount > maxParticipants) {
        sendError(client, `Connect exactly one learner screen with ${minParticipants}-${maxParticipants} participants before starting the session.`);
        return;
      }
      assignShapesToRoom(room);
      room.status = "in-progress";
      room.sessionStartedAt = room.sessionStartedAt ?? Date.now();
      room.introStartedAt = null;
      room.introCompletedAt = room.introCompletedAt ?? Date.now();
      room.protocolIntroStartedAt = null;
      room.patientReviewActiveFileId = null;
      room.patientReviewReviewedFileIds = [];
      room.selection = null;
      room.debriefStartedAt = null;
      room.closingStartedAt = null;
      room.currentParticipantId = null;
      if (usesParticipantSelection(room)) {
        startSelection(room);
      }
      broadcastState(room.code);
      break;
    }
    case "skip-intro": {
      if (client.role !== "host") return;
      room.introStartedAt = null;
      room.introCompletedAt = room.introCompletedAt ?? Date.now();
      broadcastState(room.code);
      break;
    }
    case "skip-intro-to-patient-review": {
      if (client.role !== "host") return;
      const elapsedMs = Math.max(0, Math.min(120000, Number(message.elapsedMs ?? 45000)));
      room.introStartedAt = Date.now() - elapsedMs;
      room.introCompletedAt = null;
      room.protocolIntroStartedAt = null;
      room.patientReviewActiveFileId = "identity";
      room.patientReviewReviewedFileIds = ["identity"];
      room.selection = null;
      broadcastState(room.code);
      break;
    }
    case "review-patient-file": {
      if (client.role !== "player") return;
      const fileId = String(message.fileId ?? "").trim();
      const allowed = new Set(["identity", "complaint", "hpi", "history", "meds", "report", "diagnostics"]);
      if (!allowed.has(fileId)) return;
      room.patientReviewActiveFileId = fileId;
      const reviewed = new Set(room.patientReviewReviewedFileIds ?? []);
      reviewed.add(fileId);
      room.patientReviewReviewedFileIds = [...reviewed];
      broadcastState(room.code);
      break;
    }
    case "start-protocol-assignment": {
      if (client.role !== "host") return;
      const playerConnections = connectedPlayerClients(room.code);
      const connectedParticipantCount = connectedPlayers(room.code).filter((player) => player.connected).length;
      if (playerConnections.length !== 1 || connectedParticipantCount < minParticipants || connectedParticipantCount > maxParticipants) {
        sendError(client, `Connect exactly one learner screen with ${minParticipants}-${maxParticipants} participants before assigning identities.`);
        return;
      }
      assignShapesToRoom(room);
      room.introStartedAt = null;
      room.introCompletedAt = room.introCompletedAt ?? Date.now();
      room.protocolIntroStartedAt = Date.now();
      room.patientReviewActiveFileId = null;
      room.patientReviewReviewedFileIds = [];
      room.selection = null;
      const assignmentStartedAt = room.protocolIntroStartedAt;
      broadcastState(room.code);
      // Clear after the client animation completes so re-broadcasts don't re-trigger the intro.
      setTimeout(() => {
        if (room.protocolIntroStartedAt === assignmentStartedAt) {
          room.protocolIntroStartedAt = null;
          broadcastState(room.code);
        }
      }, 24000);
      break;
    }
    case "skip-protocol-assignment": {
      if (client.role !== "host") return;
      if (!room.players.some((player) => player.shape)) {
        assignShapesToRoom(room);
      }
      room.protocolIntroStartedAt = null;
      broadcastState(room.code);
      break;
    }
    case "start-selection": {
      if (client.role !== "host") return;
      room.protocolIntroStartedAt = null;
      if (!usesParticipantSelection(room)) {
        room.selection = null;
        room.currentParticipantId = null;
        broadcastState(room.code);
        break;
      }
      if (startSelection(room)) {
        broadcastState(room.code);
      }
      break;
    }
    case "override-selection": {
      if (client.role !== "host") return;
      if (!usesParticipantSelection(room)) return;
      const playerId = String(message.playerId);
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        const selectionStartedAt = Math.max(Date.now(), (room.selection?.startedAt ?? 0) + 1);
        room.selection = {
          playerId,
          startedAt: selectionStartedAt,
          durationMs: 1400
        };
        room.currentParticipantId = playerId;
        player.turnCount++;
        broadcastState(room.code);
        setTimeout(() => {
          if (room.selection?.startedAt === selectionStartedAt) {
            room.selection = null;
            broadcastState(room.code);
          }
        }, 3800);
      }
      break;
    }
    case "open-station": {
      if (client.role !== "host") return;
      const wasLive = room.status === "in-progress";
      const nextStationPrompts = stationPrompts(message.station);
      const nextStationComplete =
        wasLive &&
        nextStationPrompts.length > 0 &&
        nextStationPrompts.every((prompt) => Boolean(room.evaluations[promptId(prompt)]));
      if (nextStationComplete) {
        sendError(client, "That station is already complete.");
        return;
      }
      if (wasLive && !activeQuestionIsEvaluated(room)) {
        sendError(client, "Mark the current question Correct, Partial, or Incorrect before moving to another station.");
        return;
      }
      room.status = room.introCompletedAt ? "in-progress" : "lobby";
      room.introStartedAt = null;
      room.selectedStation = message.station ?? null;
      if (!room.sessionStartedAt) {
        room.stationRouteStartId = selectedStationId(room) || null;
      }
      room.activePromptIndex = 0;
      room.timerEndsAt = null;
      room.liveAnswer = null;
      room.selection = null;
      room.debriefStartedAt = null;
      room.debriefFocusedPromptId = null;
      room.debriefMissedExpanded = false;
      room.closingStartedAt = null;
      if (!wasLive) {
        room.evaluations = {};
        room.activityStates = {};
      }
      room.currentParticipantId = null;
      recalculateStats(room);
      room.stats.scoreHistory.push({ at: new Date().toISOString(), score: room.score });
      broadcastState(room.code);
      if (room.status === "in-progress" && usesParticipantSelection(room)) {
        const openedStationId = selectedStationId(room);
        setTimeout(() => {
          if (room.status === "in-progress" && selectedStationId(room) === openedStationId && !room.selection) {
            if (startSelection(room)) broadcastState(room.code);
          }
        }, 4300);
      }
      break;
    }
    case "set-prompt-index": {
      if (client.role !== "host") return;
      const nextIndex = Number(message.index ?? 0);
      const currentIndex = room.activePromptIndex;
      if (room.status === "in-progress" && nextIndex > currentIndex && !activeQuestionIsEvaluated(room)) {
        sendError(client, "Mark the current question Correct, Partial, or Incorrect before moving to the next question.");
        return;
      }
      const moved = movePrompt(room, nextIndex);
      if (moved && usesParticipantSelection(room) && nextIndex > currentIndex && !activeQuestionIsEvaluated(room)) {
        startSelection(room);
      } else if (moved) {
        restoreParticipantForActivePrompt(room);
      }
      if (!usesParticipantSelection(room)) {
        room.selection = null;
        room.currentParticipantId = null;
      }
      broadcastState(room.code);
      break;
    }
    case "next-prompt": {
      if (client.role !== "host") return;
      if (room.status === "in-progress" && !activeQuestionIsEvaluated(room)) {
        sendError(client, "Mark the current question Correct, Partial, or Incorrect before moving to the next question.");
        return;
      }
      const moved = movePrompt(room, room.activePromptIndex + 1);
      if (moved && usesParticipantSelection(room) && !activeQuestionIsEvaluated(room)) {
        startSelection(room);
      } else if (moved) {
        restoreParticipantForActivePrompt(room);
      }
      if (!usesParticipantSelection(room)) {
        room.selection = null;
        room.currentParticipantId = null;
      }
      broadcastState(room.code);
      break;
    }
    case "previous-prompt": {
      if (client.role !== "host") return;
      const moved = movePrompt(room, room.activePromptIndex - 1);
      if (moved) {
        restoreParticipantForActivePrompt(room);
      }
      broadcastState(room.code);
      break;
    }
    case "start-timer": {
      if (client.role !== "host") return;
      const prompt = activePrompt(room);
      const defaultSeconds = Number(objectField(prompt, "timerSeconds") ?? 60);
      const seconds = Math.max(5, Math.min(600, Number(message.seconds ?? defaultSeconds)));
      room.timerStartedAt = Date.now();
      room.timerEndsAt = room.timerStartedAt + seconds * 1000;
      broadcastState(room.code);
      break;
    }
    case "reset-timer": {
      if (client.role !== "host") return;
      room.timerEndsAt = null;
      room.timerStartedAt = null;
      broadcastState(room.code);
      break;
    }
    case "submit-answer": {
      if (client.role !== "player") return;
      room.liveAnswer = {
        playerId: client.id,
        answer: String(message.answer ?? "").trim().slice(0, 500),
        submittedAt: new Date().toISOString(),
        responseTimeMs: typeof message.responseTimeMs === "number" ? message.responseTimeMs : undefined
      };
      broadcastState(room.code);
      break;
    }
    case "update-activity-card": {
      if (client.role !== "player") return;
      const id = String(message.promptId ?? "");
      const prompt = findPrompt(room, id);
      const state = prompt ? ensureActivityState(room, prompt) : null;
      const item = String(message.item ?? "");
      const column = typeof message.column === "string" ? message.column : null;
      const columns = objectField(objectField(prompt, "activity"), "columns");
      const validColumns = Array.isArray(columns) ? new Set(columns.map((entry) => String(objectField(entry, "title") ?? ""))) : new Set<string>();
      if (state && item in state.placements && (column === null || validColumns.has(column))) {
        state.placements[item] = column;
        state.itemResults = undefined;
        state.lastCheckedAt = undefined;
        broadcastState(room.code);
      }
      break;
    }
    case "check-activity": {
      if (client.role !== "player") return;
      const id = String(message.promptId ?? "");
      const prompt = findPrompt(room, id);
      const state = prompt ? ensureActivityState(room, prompt) : null;
      const answers = prompt ? answerMap(prompt) : new Map<string, string>();
      if (state && answers.size && state.checkCount < 2) {
        state.itemResults = Object.fromEntries(
          Object.keys(state.placements).map((item) => [item, state.placements[item] === answers.get(item)])
        );
        state.checkCount++;
        state.lastCheckedAt = new Date().toISOString();
        broadcastState(room.code);
      }
      break;
    }
    case "evaluate-prompt": {
      if (client.role !== "host") return;
      evaluatePrompt(room, message);
      broadcastState(room.code);
      break;
    }
    case "adjust-score": {
      if (client.role !== "host") return;
      room.score += Number(message.delta ?? 0);
      room.stats.scoreHistory.push({ at: new Date().toISOString(), score: room.score });
      broadcastState(room.code);
      break;
    }
    case "show-debrief": {
      if (client.role !== "host") return;
      room.debriefStartedAt = room.debriefStartedAt ?? Date.now();
      room.debriefFocusedPromptId = null;
      room.debriefMissedExpanded = false;
      room.closingStartedAt = null;
      room.selection = null;
      room.currentParticipantId = null;
      room.timerEndsAt = null;
      recalculateStats(room);
      broadcastState(room.code);
      break;
    }
    case "set-debrief-view": {
      if (client.role !== "host") return;
      if (typeof message.promptId === "string" || message.promptId === null) {
        room.debriefFocusedPromptId = message.promptId;
      }
      if (typeof message.missedExpanded === "boolean") {
        room.debriefMissedExpanded = message.missedExpanded;
      }
      broadcastState(room.code);
      break;
    }
    case "show-closing": {
      if (client.role !== "host") return;
      const alreadyEnded = Boolean(room.endedAt);
      room.debriefStartedAt = room.debriefStartedAt ?? Date.now();
      room.closingStartedAt = room.closingStartedAt ?? Date.now();
      room.status = "ended";
      room.endedAt = room.endedAt ?? new Date().toISOString();
      room.selection = null;
      room.currentParticipantId = null;
      room.timerEndsAt = null;
      recalculateStats(room);
      if (!alreadyEnded) {
        saveRoomResult(room).catch((error) => {
          console.error("Could not save room result", error);
        });
      }
      broadcastState(room.code);
      break;
    }
    case "finish-session": {
      if (client.role !== "host") return;
      const alreadyEnded = Boolean(room.endedAt);
      room.endedAt = room.endedAt ?? new Date().toISOString();
      recalculateStats(room);
      if (!alreadyEnded) {
        saveRoomResult(room).catch((error) => {
          console.error("Could not save room result", error);
        });
      }
      finishRoomSession(room);
      break;
    }
    case "end-game": {
      if (client.role !== "host") return;
      const alreadyEnded = Boolean(room.endedAt);
      markMissingPromptsIncorrect(room, message.promptIds);
      room.status = "ended";
      room.endedAt = room.endedAt ?? new Date().toISOString();
      room.timerEndsAt = null;
      room.selection = null;
      room.currentParticipantId = null;
      room.debriefStartedAt = room.debriefStartedAt ?? Date.now();
      room.closingStartedAt = null;
      recalculateStats(room);
      if (!alreadyEnded) {
        saveRoomResult(room).catch((error) => {
          console.error("Could not save room result", error);
        });
      }
      broadcastState(room.code);
      break;
    }
    default:
      sendError(client, `Unknown message type: ${message.type}`);
  }
}

function removeClient(client: WsClient) {
  const roomCode = client.roomCode;
  client.connected = false;
  clients.delete(client);
  if (roomCode) {
    broadcastState(roomCode);
  }
}

function acceptWebSocket(request: http.IncomingMessage, socket: net.Socket) {
  const key = request.headers["sec-websocket-key"];
  if (!key || Array.isArray(key)) {
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
      "\r\n"
    ].join("\r\n")
  );

  const client: WsClient = {
    id: crypto.randomUUID(),
    socket,
    buffer: Buffer.alloc(0),
    messageFragments: [],
    fragmentedOpcode: null,
    connected: true
  };

  clients.add(client);
  socket.setNoDelay(true);
  socket.setKeepAlive(true, websocketHeartbeatMs);
  socket.on("data", (chunk) => parseFrames(client, chunk));
  socket.on("close", () => removeClient(client));
  socket.on("error", () => removeClient(client));
  send(client, { type: "connected", id: client.id });
}

async function readBody(request: http.IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function handleApi(request: http.IncomingMessage, response: http.ServerResponse, pathname: string) {
  response.setHeader("Content-Type", "application/json");

  if (pathname === "/api/results" && request.method === "GET") {
    response.end(JSON.stringify(await readResults()));
    return;
  }

  if (pathname === "/api/results" && request.method === "POST") {
    const body = await readBody(request);
    await appendResult(JSON.parse(body));
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (pathname === "/api/results/reset" && request.method === "POST") {
    await ensureResultsFile();
    await fs.writeFile(resultsPath, "[]\n", "utf8");
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ error: "Not found" }));
}

function contentType(filePath: string) {
  const extension = path.extname(filePath);
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
  };
  return types[extension] ?? "application/octet-stream";
}

async function serveStatic(response: http.ServerResponse, pathname: string) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  let filePath = path.normalize(path.join(distDir, safePath));

  if (!filePath.startsWith(distDir)) {
    response.statusCode = 403;
    response.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
  } catch {
    filePath = path.join(distDir, "index.html");
  }

  response.setHeader("Content-Type", contentType(filePath));
  response.end(await fs.readFile(filePath));
}

async function createRequestHandler() {
  let vite: ViteDevServer | undefined;

  if (!isProduction) {
    const viteModule = await import("vite");
    vite = await viteModule.createServer({
      server: { middlewareMode: true, host: "0.0.0.0" },
      appType: "spa"
    });
  }

  return async (request: http.IncomingMessage, response: http.ServerResponse) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (url.pathname.startsWith("/api/")) {
      try {
        await handleApi(request, response, url.pathname);
      } catch (error) {
        response.statusCode = 500;
        response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Server error" }));
      }
      return;
    }

    if (vite) {
      vite.middlewares(request, response, () => {
        response.statusCode = 404;
        response.end("Not found");
      });
      return;
    }

    await serveStatic(response, url.pathname);
  };
}

function getLocalAddresses() {
  const addresses: string[] = [];
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }
  return addresses;
}

await loadRooms();

const handler = await createRequestHandler();
const server = http.createServer(handler);
setInterval(() => {
  for (const client of clients) {
    send(client, { type: "heartbeat", serverTime: Date.now() });
  }
}, websocketHeartbeatMs);

server.on("upgrade", (request, socket) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (url.pathname === "/ws") {
    acceptWebSocket(request, socket as net.Socket);
  } else {
    socket.destroy();
  }
});

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close();
  try {
    await flushRoomsSave();
  } catch (error) {
    console.error("Could not save active rooms during shutdown", error);
  } finally {
    process.exit(0);
  }
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());

server.listen(port, "0.0.0.0", () => {
  console.log(`Competency Stations is running on http://localhost:${port}`);
  for (const address of getLocalAddresses()) {
    console.log(`Player/other device URL: http://${address}:${port}`);
  }
});
