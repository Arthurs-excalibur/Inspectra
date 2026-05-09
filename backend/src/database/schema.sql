CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  framework TEXT,
  auth_mode TEXT NOT NULL,
  browser TEXT NOT NULL,
  environments JSONB NOT NULL DEFAULT '[]',
  ai_model TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  prompt TEXT NOT NULL,
  status TEXT NOT NULL,
  objective TEXT NOT NULL,
  current_action TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE actions (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id),
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

CREATE TABLE screenshots (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id),
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  viewport TEXT NOT NULL,
  annotation_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  severity TEXT NOT NULL,
  issue_count INTEGER NOT NULL,
  markdown_path TEXT NOT NULL,
  json_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE issues (
  id UUID PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id),
  session_id UUID NOT NULL REFERENCES sessions(id),
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  reproduction_steps JSONB NOT NULL DEFAULT '[]',
  suggested_fix TEXT NOT NULL,
  screenshot_ids JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE ai_logs (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id),
  stage TEXT NOT NULL,
  message TEXT NOT NULL,
  confidence NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  ai_provider TEXT NOT NULL,
  model TEXT NOT NULL,
  reasoning_mode TEXT NOT NULL,
  temperature NUMERIC NOT NULL,
  headless BOOLEAN NOT NULL,
  notifications JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX sessions_owner_id_idx ON sessions(owner_id);
CREATE INDEX actions_session_id_idx ON actions(session_id);
CREATE INDEX screenshots_session_id_idx ON screenshots(session_id);
CREATE INDEX reports_owner_id_idx ON reports(owner_id);
CREATE INDEX issues_report_id_idx ON issues(report_id);
CREATE INDEX ai_logs_session_id_idx ON ai_logs(session_id);
