import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClientMessage, RoomState, ServerMessage } from "../types";

type ConnectionStatus = "connecting" | "open" | "closed" | "error";

export function useRoomSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const roomRef = useRef<RoomState | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    socketRef.current = socket;
    roomRef.current = null;
    setRoom(null);
    setError("");

    socket.addEventListener("open", () => setStatus("open"));
    socket.addEventListener("close", () => {
      roomRef.current = null;
      setRoom(null);
      setStatus("closed");
    });
    socket.addEventListener("error", () => {
      roomRef.current = null;
      setRoom(null);
      setStatus("error");
    });
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as ServerMessage;
      if (message.type === "connected") setClientId(message.id);
      if (message.type === "room-created" || message.type === "room-joined" || message.type === "state") {
        roomRef.current = message.room;
        setRoom(message.room);
      }
      if (message.type === "room-left") {
        roomRef.current = null;
        setRoom(null);
        if (message.reason) setError(message.reason);
      }
      if (message.type === "error") setError(message.message);
    });

    return () => {
      socket.close();
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
      clearError: () => setError(""),
      send
    }),
    [clientId, error, room, send, status]
  );
}
