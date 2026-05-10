"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useInspectraStore } from "@/stores/use-inspectra-store";
import { useAuthStore } from "@/stores/use-auth-store";

const SOCKET_URL = "http://localhost:4000";

export function useRealtimeSession() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const paused = useInspectraStore((state) => state.sessionPaused);
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

    s.on("event", (payload: any) => {
      const { type, sessionId } = payload;

      switch (type) {
        case "session_started":
          pushToast({ type: "success", title: "Session started", detail: payload.session.objective });
          break;
        
        case "workflow_progress":
          // Handle progress if needed
          break;

        case "navigation":
        case "click":
        case "form_fill":
          pushToast({ type: "success", title: "Agent action", detail: payload.action.label });
          break;

        case "issue_detected":
          pushToast({ type: "critical", title: "Issue detected", detail: payload.issue.title });
          break;

        case "screenshot_captured":
          // Our live stream uses base64
          if (payload.screenshot.path.startsWith("data:")) {
             useInspectraStore.getState().setLiveFrame(payload.screenshot.path);
          }
          break;
        
        case "reasoning_chunk":
          // In a real app we'd append to a log array
          break;
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [paused, pushToast, token]);

  return {
    socket,
    transport: socket?.connected ? "websocket-ready" : "connecting",
  };
}
