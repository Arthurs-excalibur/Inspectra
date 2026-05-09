# Inspectra — Backend Product Requirements Document (PRD)

# Product Overview

Inspectra is an AI-native autonomous QA testing platform that combines:

- browser automation
- AI reasoning
- visual analysis
- autonomous exploration
- screenshot intelligence
- automated reporting
- MCP-powered tooling

The backend acts as the autonomous orchestration layer powering the entire platform.

It manages:
- AI agents
- browser sessions
- workflows
- memory
- screenshot pipelines
- realtime communication
- report generation
- MCP integrations
- execution history

The backend must integrate seamlessly with the frontend dashboard and support both:
- local-first execution
- cloud-enabled deployment

---

# Backend Goals

## Primary Goals

1. Orchestrate autonomous AI QA agents
2. Execute browser automation reliably
3. Maintain realtime synchronization with frontend
4. Generate actionable reports automatically
5. Support extensible MCP tool architecture
6. Enable scalable multi-session execution
7. Support local and cloud AI models
8. Maintain transparent execution state

---

# Backend Architecture Philosophy

## Core Principles

### 1. Agent-Centric Architecture
The backend revolves around autonomous AI agents.

Every test session is an orchestrated AI workflow.

---

### 2. Event-Driven System
All major actions emit events.

This enables:
- realtime frontend updates
- session replay
- debugging
- observability
- analytics

---

### 3. Modular MCP Integration
All tools should be abstracted through MCP-compatible interfaces.

---

### 4. Streaming-First Design
The frontend should receive:
- live reasoning
- screenshots
- browser events
- logs
- status updates

with minimal latency.

---

### 5. Fault Tolerance
Agents must recover gracefully from:
- browser crashes
- selector failures
- network issues
- hallucinations
- timeout failures

---

# High-Level Architecture

```text
Frontend Dashboard
        ↓
API Gateway
        ↓
Realtime Gateway (WebSocket)
        ↓
Agent Orchestrator
        ↓
------------------------------------------------
| AI Engine | Browser Engine | MCP Tool Layer |
------------------------------------------------
        ↓
Storage + Reporting + Analytics
```

---

# Backend Technology Stack

# Core Runtime

## Language
- TypeScript

## Runtime
- Node.js

---

# Backend Framework

## Recommended
- NestJS

Why:
- scalable architecture
- WebSocket support
- modular structure
- dependency injection
- enterprise-grade organization

---

# Browser Automation

## Primary
- Playwright

Supported Browsers:
- Chromium
- Firefox
- WebKit

---

# AI Integration

## Local Models
- Ollama

## Cloud Providers
- OpenRouter
- OpenAI-compatible APIs

---

# Database

## Primary
- PostgreSQL

---

# Cache + Queue

## Redis
Used for:
- queues
- session state
- realtime pub/sub
- caching

---

# File Storage

## Local Storage (MVP)
Stores:
- screenshots
- logs
- reports
- traces

---

## Future
- S3-compatible storage

---

# Vector Memory

## Optional Phase 2
- Qdrant
- Chroma

Used for:
- long-term memory
- semantic issue search
- historical QA context

---

# Realtime Layer

## WebSocket Gateway

Responsible for:
- live browser updates
- streaming logs
- AI reasoning feed
- screenshot delivery
- session synchronization

---

# Authentication System

## MVP
- email/password
- JWT authentication

---

## Future
- GitHub OAuth
- Google OAuth
- SSO

---

# Core Backend Services

# 1. Agent Orchestrator Service

## Purpose
Central brain coordinating autonomous agents.

---

## Responsibilities

### Agent Lifecycle
- create agents
- initialize context
- assign tools
- manage memory
- terminate sessions

---

## Workflow Execution

Coordinates:
- prompts
- browser actions
- screenshot analysis
- retries
- validations

---

## Failure Recovery
Handles:
- retries
- fallback strategies
- self-healing behavior

---

## Frontend Integration
Streams:
- current actions
- reasoning
- confidence
- execution state

---

# 2. Browser Automation Service

## Purpose
Controls browser sessions.

---

## Responsibilities

### Browser Management
- launch browsers
- manage contexts
- isolate sessions
- close resources safely

---

## Automation Execution
Supports:
- clicks
- typing
- navigation
- assertions
- scrolling
- hover events
- screenshots

---

## Session Recording
Stores:
- traces
- console logs
- screenshots
- network events

---

## Frontend Integration
Streams:
- browser frames
- interaction highlights
- live state updates

---

# 3. AI Reasoning Engine

## Purpose
Transforms user prompts into autonomous QA behavior.

---

## Responsibilities

### Prompt Parsing
Example:

```text
"Test checkout flow and detect mobile UI issues"
```

Transforms into structured execution goals.

---

## Decision Making
AI determines:
- next actions
- fallback logic
- retry conditions
- issue severity

---

## UX Analysis
AI evaluates:
- layout quality
- responsiveness
- accessibility
- visual hierarchy

---

## Report Writing
Generates:
- issue summaries
- reproduction steps
- suggested fixes
- executive reports

---

## Frontend Integration
Streams reasoning text progressively.

---

# 4. Screenshot Analysis Service

## Purpose
Handles visual intelligence.

---

## Responsibilities

### Screenshot Capture
Captures:
- full page
- viewport
- element-level screenshots

---

## Visual Comparison
Detects:
- layout shifts
- missing elements
- overlapping components
- broken spacing
- visual regressions

---

## Annotation Engine
Highlights:
- problem areas
- affected components
- severity indicators

---

## Frontend Integration
Provides:
- diff overlays
- comparison assets
- annotated screenshots

---

# 5. Reporting Service

## Purpose
Generates structured QA reports.

---

## Responsibilities

### Report Generation
Creates:
- markdown reports
- JSON reports
- PDF-ready structures

---

## Issue Classification
Categories:
- critical
- warning
- cosmetic
- accessibility
- UX

---

## Export System
Supports:
- GitHub issue export
- Jira formatting
- downloadable reports

---

## Frontend Integration
Feeds:
- report pages
- issue lists
- report timelines

---

# 6. Realtime Communication Service

## Purpose
Maintains live synchronization with frontend.

---

## Realtime Events

### Session Events
- session_started
- session_paused
- session_completed
- session_failed

---

### Browser Events
- navigation
- click
- form_fill
- screenshot_captured

---

### AI Events
- reasoning_chunk
- confidence_update
- issue_detected

---

### Report Events
- report_generated
- issue_classified

---

# 7. Project Management Service

## Responsibilities

### Project CRUD
- create project
- update project
- archive project
- environment management

---

### Environment Management
Supports:
- development
- staging
- production

---

### Test Suite Storage
Stores reusable workflows.

---

# 8. MCP Integration Layer

## Purpose
Abstract external tools.

---

## Supported MCP Tools

### Browser MCP
Controls Playwright.

---

### Filesystem MCP
Stores reports and assets.

---

### Screenshot MCP
Image analysis and comparison.

---

### GitHub MCP
Issue creation and repository integration.

---

### Terminal MCP
Optional advanced automation.

---

# Backend API Design

# REST API

## Purpose
Handles:
- authentication
- projects
- reports
- settings
- historical queries

---

# WebSocket API

## Purpose
Handles realtime communication.

Streams:
- browser state
- AI reasoning
- logs
- screenshots
- progress

---

# Core API Endpoints

# Authentication

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

---

# Projects

```text
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
```

---

# Sessions

```text
POST   /sessions/start
POST   /sessions/:id/pause
POST   /sessions/:id/resume
POST   /sessions/:id/stop
GET    /sessions/:id
```

---

# Reports

```text
GET    /reports
GET    /reports/:id
POST   /reports/export
```

---

# Settings

```text
GET    /settings
PATCH  /settings
```

---

# Frontend ↔ Backend Integration

# Dashboard Integration

Frontend receives:
- recent reports
- statistics
- active sessions
- live metrics

via REST + WebSocket.

---

# Live Session Integration

Frontend streams:
- browser screenshots
- AI reasoning
- action logs
- timeline updates

in realtime.

---

# Reports Integration

Frontend pulls:
- issue data
- screenshots
- annotations
- playback timelines

---

# Visual Regression Integration

Frontend requests:
- before screenshots
- after screenshots
- diff layers
- AI annotations

---

# Realtime Event Flow

```text
AI Action
    ↓
Agent Orchestrator
    ↓
WebSocket Gateway
    ↓
Frontend Updates Instantly
```

---

# Database Schema Overview

# Core Tables

## users
Stores authentication and profile data.

---

## projects
Stores project configurations.

---

## sessions
Stores execution sessions.

---

## actions
Stores browser actions and timelines.

---

## screenshots
Stores screenshot metadata.

---

## reports
Stores generated reports.

---

## issues
Stores detected QA issues.

---

## ai_logs
Stores reasoning history.

---

# Session Execution Flow

```text
User Prompt
    ↓
Frontend Sends Request
    ↓
Agent Created
    ↓
Browser Session Starts
    ↓
AI Generates Plan
    ↓
Automation Executes
    ↓
Screenshots Captured
    ↓
AI Evaluates Results
    ↓
Issues Detected
    ↓
Report Generated
    ↓
Frontend Updates Live
```

---

# AI Prompt Pipeline

# Stages

## 1. Intent Extraction
Understand user goal.

---

## 2. Execution Planning
Generate browser strategy.

---

## 3. Action Execution
Playwright executes commands.

---

## 4. Observation Analysis
AI analyzes screenshots and DOM.

---

## 5. Reflection
AI evaluates whether goals succeeded.

---

## 6. Reporting
Generate findings.

---

# Error Recovery System

## Common Recovery Strategies

### Retry Actions
If element missing.

---

### Alternative Selectors
AI finds replacement selectors.

---

### Scroll Recovery
If elements hidden.

---

### Navigation Recovery
If page redirect fails.

---

### Browser Restart
If browser crashes.

---

# Observability System

## Logging
Structured logs for:
- AI decisions
- browser events
- API failures
- session state

---

## Metrics
Track:
- test duration
- pass rate
- issue accuracy
- retry frequency
- model latency

---

## Tracing
Track complete session execution chains.

---

# Security Requirements

## Backend Security

### Must Include
- JWT validation
- rate limiting
- encrypted secrets
- sandboxed execution
- browser isolation
- secure file handling

---

# Performance Requirements

## Backend Must
- support concurrent sessions
- maintain realtime responsiveness
- optimize screenshot processing
- minimize AI latency
- recover from failures automatically

---

# Scalability Planning

## Future Scaling

### Horizontal Scaling
Separate services:
- AI workers
- browser workers
- screenshot workers

---

### Queue System
Use Redis queues for:
- browser tasks
- report generation
- screenshot analysis

---

# Deployment Architecture

# Local Mode

## User Runs
- frontend desktop app
- local backend
- Ollama
- local Playwright

Ideal for privacy-focused developers.

---

# Cloud Mode

## Hosted Deployment
Supports:
- remote agents
- shared dashboards
- team collaboration

---

# CI/CD Integration (Phase 2)

## Future Support
- GitHub Actions
- GitLab CI
- Jenkins
- Vercel deployments

---

# Future Backend Features

# Multi-Agent Collaboration
Multiple agents coordinate tasks.

---

# Autonomous Exploration Mode
AI crawls applications automatically.

---

# Persistent QA Memory
AI remembers historical issues.

---

# Self-Healing Test System
AI rewrites failing selectors.

---

# AI Risk Prediction
Predict unstable flows before failures occur.

---

# MVP Backend Scope

# Must Build First

## Core Features
- authentication
- project management
- Playwright automation
- AI reasoning pipeline
- screenshot capture
- report generation
- WebSocket streaming
- live session updates
- frontend synchronization

---

# Excluded From MVP

## Phase 2 Features
- multi-agent orchestration
- vector memory
- cloud scaling
- advanced visual AI
- CI/CD integrations
- team collaboration

---

# Suggested Backend Folder Structure

```text
src/
 ├── modules/
 │    ├── auth/
 │    ├── projects/
 │    ├── sessions/
 │    ├── reports/
 │    ├── ai/
 │    ├── browser/
 │    ├── websocket/
 │    ├── screenshots/
 │    ├── mcp/
 │    └── settings/
 │
 ├── common/
 ├── database/
 ├── queues/
 ├── workers/
 ├── gateways/
 ├── services/
 ├── utils/
 ├── types/
 └── config/
```

---

# Final Vision

Inspectra's backend should function as:

"An autonomous AI orchestration engine for intelligent QA testing."

The backend must:
- power realtime AI workflows
- maintain transparent execution
- synchronize perfectly with the frontend
- support extensible MCP tooling
- scale into a multi-agent AI testing platform

The final system should feel significantly more advanced than traditional automation frameworks by combining:
- browser automation
- AI reasoning
- visual intelligence
- autonomous workflows
- realtime observability
- intelligent reporting

into one cohesive AI-native platform.

