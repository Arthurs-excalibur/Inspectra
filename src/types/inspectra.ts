import type { LucideIcon } from "lucide-react";

export type ScreenId =
  | "dashboard"
  | "projects"
  | "live"
  | "reports"
  | "visual"
  | "logs"
  | "settings";

export type Status = "success" | "warning" | "error" | "running" | "idle";

export type NavItem = {
  id: ScreenId;
  label: string;
  icon: LucideIcon;
};

export type AgentStatus = {
  id: string;
  name: string;
  status: Status;
  currentAction: string;
  objective: string;
  confidence: number;
};

export type ActivityItem = {
  id: string;
  type: "run" | "failure" | "report" | "discovery";
  title: string;
  detail: string;
  time: string;
};

export type Project = {
  id: string;
  name: string;
  framework: string;
  baseUrl: string;
  lastRun: string;
  passRate: number;
  environments: string[];
  auth: "none" | "basic" | "oauth" | "session";
  browser: "Chrome" | "Firefox" | "Edge";
  model: string;
};

export type TimelineEvent = {
  id: string;
  time: string;
  type: "page-load" | "click" | "fill" | "navigation" | "error" | "screenshot";
  label: string;
  status: Status;
};

export type Screenshot = {
  id: string;
  label: string;
  viewport: "desktop" | "tablet" | "mobile";
  issue?: string;
};

export type ReportIssue = {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info";
  confidence: number;
  reproductionSteps: string[];
  suggestedFix: string;
};

export type Report = {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info";
  environment: string;
  generatedAt: string;
  issueCount: number;
  summary: string;
  issues: ReportIssue[];
  technicalLogs: string[];
};
