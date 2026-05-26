import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ViteDevServer } from "vite";

type ClientRole = "host" | "player";

type WireMessage = {
  type: string;
  [key: string]: unknown;
};

type PlayerState = {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
};

type GameStats = {
  answered: number;
  correct: number;
  incorrect: number;
  scoreHistory: Array<{ at: string; score: number }>;
  missedQuestionIds: string[];
};

type RoomState = {
  code: string;
  status: "lobby" | "playing" | "ended";
  score: number;
  selectedQuestion: unknown | null;
  revealed: boolean;
  timerEndsAt: number | null;
  usedQuestionIds: string[];
  liveAnswer: { playerId: string; answer: string; submittedAt: string; responseTimeMs?: number } | null;
  feedback: { questionId: string; correct: boolean; answer: string; explanation: string } | null;
  players: PlayerState[];
  createdAt: string;
  endedAt?: string;
  stats: GameStats;
};

type WsClient = {
  id: string;
  socket: net.Socket;
  buffer: Buffer;
  role?: ClientRole;
  roomCode?: string;
  name?: string;
  ready?: boolean;
  connected: boolean;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const dataDir = path.join(rootDir, "data");
const resultsPath = path.join(dataDir, "results.json");
const port = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === "production";

const clients = new Set<WsClient>();
const rooms = new Map<string, RoomState>();

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function createInitialRoom(code: string): RoomState {
  return {
    code,
    status: "lobby",
    score: 0,
    selectedQuestion: null,
    revealed: false,
    timerEndsAt: null,
    usedQuestionIds: [],
    liveAnswer: null,
    feedback: null,
    players: [],
    createdAt: new Date().toISOString(),
    stats: {
      answered: 0,
      correct: 0,
      incorrect: 0,
      scoreHistory: [{ at: new Date().toISOString(), score: 0 }],
      missedQuestionIds: []
    }
  };
}

function publicRoom(room: RoomState): RoomState {
  const connectedPlayers = [...clients]
    .filter((client) => client.roomCode === room.code && client.role === "player")
    .map((client) => ({
      id: client.id,
      name: client.name ?? "Player",
      ready: Boolean(client.ready),
      connected: client.connected
    }));

  room.players = connectedPlayers;
  return room;
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

  client.socket.write(Buffer.concat([header, json]));
}

function sendError(client: WsClient, message: string) {
  send(client, { type: "error", message });
}

function broadcastRoom(roomCode: string, message: WireMessage) {
  for (const client of clients) {
    if (client.roomCode === roomCode) send(client, message);
  }
}

function broadcastState(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;
  broadcastRoom(roomCode, { type: "state", room: publicRoom(room) });
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

async function saveRoomResult(room: RoomState) {
  await appendResult({
    id: crypto.randomUUID(),
    roomCode: room.code,
    mode: "host-game",
    createdAt: room.createdAt,
    endedAt: room.endedAt ?? new Date().toISOString(),
    score: room.score,
    answered: room.stats.answered,
    correct: room.stats.correct,
    incorrect: room.stats.incorrect,
    accuracy: room.stats.answered ? Math.round((room.stats.correct / room.stats.answered) * 100) : 0,
    missedQuestionIds: room.stats.missedQuestionIds,
    scoreHistory: room.stats.scoreHistory
  });
}

function parseFrames(client: WsClient, chunk: Buffer) {
  client.buffer = Buffer.concat([client.buffer, chunk]);

  while (client.buffer.length >= 2) {
    const firstByte = client.buffer[0];
    const secondByte = client.buffer[1];
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

    if (opcode !== 0x1) continue;

    try {
      handleSocketMessage(client, JSON.parse(payload.toString("utf8")) as WireMessage);
    } catch {
      sendError(client, "The server received a message it could not understand.");
    }
  }
}

function questionField(question: unknown, field: string) {
  if (question && typeof question === "object" && field in question) {
    return (question as Record<string, unknown>)[field];
  }
  return undefined;
}

function handleSocketMessage(client: WsClient, message: WireMessage) {
  if (message.type === "create-room") {
    const code = createRoomCode();
    const room = createInitialRoom(code);
    rooms.set(code, room);
    client.role = "host";
    client.roomCode = code;
    send(client, { type: "room-created", room: publicRoom(room) });
    return;
  }

  if (message.type === "join-room") {
    const code = String(message.code ?? "").trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      sendError(client, "Room not found. Check the code on the host screen.");
      return;
    }

    client.role = "player";
    client.roomCode = code;
    client.name = String(message.name ?? "Player").trim().slice(0, 24) || "Player";
    client.ready = false;
    send(client, { type: "room-joined", room: publicRoom(room) });
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
    case "player-ready": {
      client.ready = Boolean(message.ready);
      broadcastState(room.code);
      break;
    }
    case "start-session": {
      if (client.role !== "host") return;
      room.status = "playing";
      room.feedback = null;
      broadcastState(room.code);
      break;
    }
    case "select-question": {
      if (client.role !== "host") return;
      const question = message.question ?? null;
      const questionId = String(questionField(question, "id") ?? "");
      room.status = "playing";
      room.selectedQuestion = question;
      room.revealed = false;
      room.feedback = null;
      room.liveAnswer = null;
      room.timerEndsAt = null;
      if (questionId && !room.usedQuestionIds.includes(questionId)) {
        room.usedQuestionIds.push(questionId);
      }
      broadcastState(room.code);
      break;
    }
    case "reveal-answer": {
      if (client.role !== "host") return;
      room.revealed = true;
      broadcastState(room.code);
      break;
    }
    case "start-timer": {
      if (client.role !== "host") return;
      const seconds = Math.max(5, Math.min(180, Number(message.seconds ?? 30)));
      room.timerEndsAt = Date.now() + seconds * 1000;
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
    case "mark-answer": {
      if (client.role !== "host" || !room.selectedQuestion) return;
      const correct = Boolean(message.correct);
      const points = Number(questionField(room.selectedQuestion, "points") ?? 0);
      const questionId = String(questionField(room.selectedQuestion, "id") ?? "");
      room.score += correct ? points : -Math.floor(points / 2);
      room.stats.answered += 1;
      if (correct) {
        room.stats.correct += 1;
      } else {
        room.stats.incorrect += 1;
        if (questionId) room.stats.missedQuestionIds.push(questionId);
      }
      room.stats.scoreHistory.push({ at: new Date().toISOString(), score: room.score });
      room.feedback = {
        questionId,
        correct,
        answer: String(questionField(room.selectedQuestion, "answer") ?? ""),
        explanation: String(questionField(room.selectedQuestion, "explanation") ?? "")
      };
      room.revealed = true;
      room.timerEndsAt = null;
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
    case "end-game": {
      if (client.role !== "host") return;
      room.status = "ended";
      room.endedAt = new Date().toISOString();
      room.timerEndsAt = null;
      saveRoomResult(room).catch((error) => {
        console.error("Could not save room result", error);
      });
      broadcastState(room.code);
      break;
    }
    default:
      sendError(client, `Unknown message type: ${message.type}`);
  }
}

function removeClient(client: WsClient) {
  client.connected = false;
  clients.delete(client);
  if (client.roomCode) broadcastState(client.roomCode);
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
    connected: true
  };

  clients.add(client);
  socket.setNoDelay(true);
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

const handler = await createRequestHandler();
const server = http.createServer(handler);

server.on("upgrade", (request, socket) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (url.pathname === "/ws") {
    acceptWebSocket(request, socket as net.Socket);
  } else {
    socket.destroy();
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Competency Stations is running on http://localhost:${port}`);
  for (const address of getLocalAddresses()) {
    console.log(`Player/other device URL: http://${address}:${port}`);
  }
});
