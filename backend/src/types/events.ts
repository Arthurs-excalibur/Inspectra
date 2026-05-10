import type { Action, AiLog, Issue, Report, Screenshot, Session } from "@/types/domain";

export type RealtimeEventType =
  | "session_started"
  | "session_paused"
  | "session_resumed"
  | "session_completed"
  | "session_failed"
  | "browser_event"
  | "navigation"
  | "click"
  | "form_fill"
  | "screenshot_captured"
  | "reasoning_chunk"
  | "confidence_update"
  | "issue_detected"
  | "issue_classified"
  | "report_generated"
  | "approval_required"
  | "workflow_progress"
  | "log";

export type RealtimeEvent =
  | { type: "session_started" | "session_paused" | "session_resumed" | "session_completed" | "session_failed"; session: Session }
  | { type: "browser_event" | "navigation" | "click" | "form_fill"; sessionId: string; action: Action }
  | { type: "approval_required"; sessionId: string; action: Partial<Action> }
  | { type: "screenshot_captured"; sessionId: string; screenshot: Screenshot }
  | { type: "reasoning_chunk"; sessionId: string; log: AiLog }
  | { type: "confidence_update"; sessionId: string; confidence: number }
  | { type: "issue_detected" | "issue_classified"; sessionId: string; issue: Issue }
  | { type: "report_generated"; sessionId: string; report: Report }
  | { type: "workflow_progress"; sessionId: string; step: number; totalSteps: number; status: string }
  | { type: "log"; sessionId?: string; level: "info" | "warn" | "error"; message: string; timestamp: string };
