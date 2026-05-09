"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useInspectraStore } from "@/stores/use-inspectra-store";
import { useAuthStore } from "@/stores/use-auth-store";

const SOCKET_URL = "http://localhost:4000/realtime";

export function useRealtimeSession() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const paused = useInspectraStore((state) => state.sessionPaused);
  const advanceReasoning = useInspectraStore((state) => state.advanceReasoning);
  const pushToast = useInspectraStore((state) => state.pushToast);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    s.on("connect", () => {
      console.log("Connected to Inspectra Realtime Gateway");
    });

    s.on("ai:thought", (data) => {
      if (!paused) {
        advanceReasoning();
        // Potentially push more specific data to a separate log store later
      }
    });

    s.on("action:started", (data) => {
      pushToast({
        type: "success",
        title: "Action started",
        detail: data.label,
      });
    });

    s.on("issue:detected", (data) => {
      pushToast({
        type: "critical",
        title: "Issue detected",
        detail: data.title,
      });
    });

    s.on("approval_required", (data) => {
      pushToast({
        type: "intervention",
        title: "Action intercepted",
        detail: `Safety gate: ${data.action.label}. Manual approval required.`,
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [advanceReasoning, paused, pushToast]);

  return {
    socket,
    transport: socket?.connected ? "websocket-ready" : "connecting",
  };
}
