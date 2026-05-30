import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClientMessage, RoomState, ServerMessage } from "../types";

type ConnectionStatus = "connecting" | "open" | "closed" | "error";

export function useRoomSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const roomRef = useRef<RoomState | null>(null);
  const intentionalCloseRef = useRef(false);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [finishedAt, setFinishedAt] = useState<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer = 0;

    function connect() {
      if (disposed) return;
      intentionalCloseRef.current = false;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
      socketRef.current = socket;
      roomRef.current = null;
      setRoom(null);
      setStatus("connecting");

      socket.addEventListener("open", () => {
        if (disposed) return;
        setStatus("open");
      });
      socket.addEventListener("close", () => {
        if (disposed) return;
        roomRef.current = null;
        setRoom(null);
        setStatus("closed");
        if (intentionalCloseRef.current) return;
        reconnectTimer = window.setTimeout(connect, 1000);
      });
      socket.addEventListener("error", () => {
        if (disposed) return;
        setStatus("error");
      });
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data) as ServerMessage;
        if (message.type === "connected") setClientId(message.id);
        if (message.type === "room-created" || message.type === "room-joined" || message.type === "state") {
          roomRef.current = message.room;
          setRoom(message.room);
          setError("");
        }
        if (message.type === "room-left") {
          roomRef.current = null;
          setRoom(null);
          if (message.reason) setError(message.reason);
        }
        if (message.type === "session-finished") {
          intentionalCloseRef.current = true;
          roomRef.current = null;
          setRoom(null);
          setFinishedAt(Date.now());
          socket.close();
        }
        if (message.type === "error") setError(message.message);
      });
    }

    connect();

    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const send = useCallback((message: ClientMessage) => {
    const socket = socketRef.current;
    const canSendWithoutRoom = message.type === "create-room" || message.type === "resume-host" || message.type === "join-room";
    if (!canSendWithoutRoom && !roomRef.current) return;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, []);

  return useMemo(
    () => ({
      status,
      room,
      clientId,
      error,
      finishedAt,
      clearError: () => setError(""),
      send
    }),
    [clientId, error, finishedAt, room, send, status]
  );
}
