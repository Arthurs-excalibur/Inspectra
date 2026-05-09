# Inspectra Backend

NestJS backend for `inspectra_backend_prd_v_1.md`.

## Stack

- TypeScript + Node.js
- NestJS REST API and WebSocket gateway
- JWT email/password auth
- Playwright browser automation service
- PostgreSQL-ready repository boundary with local development fallback
- Redis-ready queue/pubsub boundary with local development fallback
- Local file storage for screenshots, logs, reports, and traces

## Run

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

The API listens on `http://localhost:4000` by default.

## Core Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `POST /sessions/start`
- `POST /sessions/:id/pause`
- `POST /sessions/:id/resume`
- `POST /sessions/:id/stop`
- `GET /sessions/:id`
- `GET /reports`
- `GET /reports/:id`
- `POST /reports/export`
- `GET /settings`
- `PATCH /settings`
- `GET /dashboard`

## WebSocket

Connect to `/realtime`. Session events include `session_started`, `reasoning_chunk`, `browser_event`, `screenshot_captured`, `issue_detected`, `report_generated`, and `session_completed`.
