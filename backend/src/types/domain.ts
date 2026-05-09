export type EntityId = string;

export type Severity = "critical" | "warning" | "cosmetic" | "accessibility" | "ux" | "info";

export type SessionStatus = "created" | "running" | "paused" | "completed" | "failed" | "stopped";

export type BrowserName = "chromium" | "firefox" | "webkit";

export type User = {
  id: EntityId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Project = {
  id: EntityId;
  ownerId: EntityId;
  name: string;
  baseUrl: string;
  framework?: string;
  authMode: "none" | "basic" | "oauth" | "session";
  browser: BrowserName;
  environments: string[];
  aiModel: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: EntityId;
  projectId: EntityId;
  ownerId: EntityId;
  prompt: string;
  status: SessionStatus;
  objective: string;
  currentAction: string;
  confidence: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type Action = {
  id: EntityId;
  sessionId: EntityId;
  type: "navigation" | "click" | "form_fill" | "assertion" | "scroll" | "hover" | "screenshot" | "recovery";
  label: string;
  status: "pending" | "running" | "success" | "failed" | "approved";
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export type Screenshot = {
  id: EntityId;
  sessionId: EntityId;
  label: string;
  path: string;
  viewport: "desktop" | "tablet" | "mobile";
  annotationPath?: string;
  createdAt: string;
};

export type Issue = {
  id: EntityId;
  reportId: EntityId;
  sessionId: EntityId;
  title: string;
  severity: Severity;
  category: "functional" | "accessibility" | "visual" | "ux" | "performance";
  confidence: number;
  reproductionSteps: string[];
  suggestedFix: string;
  screenshotIds: EntityId[];
};

export type Report = {
  id: EntityId;
  sessionId: EntityId;
  projectId: EntityId;
  ownerId: EntityId;
  title: string;
  summary: string;
  severity: Severity;
  issueCount: number;
  markdownPath: string;
  jsonPath: string;
  createdAt: string;
};

export type AiLog = {
  id: EntityId;
  sessionId: EntityId;
  stage: "intent" | "planning" | "action" | "observation" | "reflection" | "reporting";
  message: string;
  confidence?: number;
  timestamp: string;
};

export type UserSettings = {
  userId: EntityId;
  aiProvider: "mock" | "ollama" | "openai-compatible";
  model: string;
  reasoningMode: "balanced" | "high" | "transparent";
  temperature: number;
  headless: boolean;
  notifications: {
    desktop: boolean;
    webhook?: string;
    discord?: string;
    slack?: string;
  };
};
