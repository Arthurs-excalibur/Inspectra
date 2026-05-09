# 🕵️‍♂️ Inspectra

### The AI-Native QA Command Center for Autonomous Testing

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue.svg)]()
[![Status](https://img.shields.io/badge/status-Early%20Development-orange.svg)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%20|%20NestJS%20|%20Postgres-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blueviolet.svg)]()

**Inspectra** is an autonomous QA platform that uses AI agents to navigate, test, and report on web applications. By combining LLM-powered reasoning with advanced browser automation, Inspectra transforms manual testing into a self-healing, intelligent command center.

---

## 📖 Overview

In today’s rapid deployment cycles, traditional end-to-end (E2E) tests are notoriously brittle and expensive to maintain. **Inspectra** eliminates this friction by introducing an **Autonomous Testing Layer**.

Instead of writing hundreds of lines of static selectors, you give Inspectra a high-level objective—like *"Validate the user registration flow and check for visual inconsistencies on mobile"*—and the agent takes care of the rest.

### Why Inspectra?
- **Zero Maintenance**: AI agents adapt to UI changes automatically, ending the era of broken selectors.
- **Visual Intelligence**: Detects "invisible" bugs like overlapping elements and layout shifts across viewports.
- **Human-Like Reasoning**: Understands intent, makes decisions, and handles edge cases dynamically.
- **Actionable Insights**: Generates structured reports with reproduction steps, screenshots, and visual diffs.

---

## ✨ Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Autonomous Testing** | Agent-led exploration based on high-level objectives. | ✅ Beta |
| **Reasoning Feed** | Real-time "thought process" logs showing agent intent. | ✅ Beta |
| **Visual Regression** | Pixel-perfect comparison and multimodal bug detection. | 🚧 Dev |
| **Multi-Viewport** | Automatic testing across Desktop, Tablet, and Mobile. | ✅ Beta |
| **Self-Healing** | Dynamic recovery from selector changes and loading lags. | ✅ Beta |
| **Report Generation** | Automated Markdown/JSON reports with session traces. | ✅ Beta |
| **CI/CD Integration** | GitHub Actions and GitLab CI support. | 📅 Roadmap |
| **Plugin System** | Custom agent behaviors and custom MCP tools. | 📅 Roadmap |

---

## 🏗 Architecture

Inspectra is built with a decoupled architecture designed for high throughput and reliable browser orchestration.

```mermaid
graph TD
    User((User)) -->|Objectives| WebApp[Next.js AppShell]
    WebApp -->|Commands| Backend[NestJS Engine]
    Backend -->|Job| Queue[Redis/BullMQ]
    Queue -->|Process| Worker[Agent Worker]
    Worker -->|Reasoning| LLM[Ollama/OpenAI]
    Worker -->|Action| Browser[Playwright/CDP]
    Browser -->|Observations| Worker
    Worker -->|State| DB[(PostgreSQL)]
    Worker -->|Reports| Storage[Local/S3]
```

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16, TailwindCSS, Framer Motion, Zustand, Tauri |
| **Backend** | NestJS, TypeORM, BullMQ, Redis |
| **AI Engine** | Ollama, OpenAI-Compatible APIs, LangChain |
| **Automation** | Playwright, Browser Context Isolation |
| **Database** | PostgreSQL 16+ |
| **Infrastructure** | Docker, Node.js 20+ |

---

## 📸 Screenshots

> [!NOTE]
> *UI screenshots coming soon. View the conceptual layout below.*

![Dashboard Overview](https://via.placeholder.com/1200x600/111823/5ad7ff?text=Dashboard+Overview:+Real-time+QA+Metrics)
*The Mission Control dashboard provides a high-level overview of pass rates, active sessions, and detected issues.*

![Live Session Monitoring](https://via.placeholder.com/1200x600/111823/5ad7ff?text=Live+Session+Monitoring)
*Monitor the AI Agent in real-time as it reasons through your application and handles interactions.*

---

## 🚀 Installation

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL 16+
- Redis (for session queuing)
- Ollama (optional, for local LLM execution)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/inspectra.git
cd inspectra
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your DB and Redis credentials
npm run dev
```

### 3. Frontend Setup
```bash
# Return to root
npm install
npm run dev
```

### 4. Database Initialization
Inspectra uses TypeORM synchronization in development. Ensure your PostgreSQL database is created and the `DATABASE_URL` in `.env` is correct.

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=4000
NODE_ENV=development

# Auth
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/inspectra

# Redis
REDIS_URL=redis://localhost:6379

# AI Configuration
AI_PROVIDER=mock # mock, ollama, or openai-compatible
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=sk-...

# Automation
PLAYWRIGHT_HEADLESS=true
STORAGE_DIR=./storage
```

---

## 📂 Project Structure

```text
inspectra/
├── backend/                # NestJS Backend API
│   ├── src/
│   │   ├── database/       # TypeORM Entities & Services
│   │   ├── modules/        # Auth, AI, Browser, Reports
│   │   └── queues/         # BullMQ Workers
├── src/                    # Next.js Frontend
│   ├── components/         # Atomic UI & Screen Modules
│   ├── hooks/              # Custom Data & Realtime Hooks
│   ├── services/           # API & Socket Clients
│   └── stores/             # Zustand State Management
├── public/                 # Static Assets
└── package.json            # Root Workspace Config
```

---

## 🛤 Roadmap

- [x] Core Autonomous Agent (Alpha)
- [x] Live Session Monitoring
- [x] Multimodal Bug Detection (DOM + Screenshots)
- [ ] Visual Regression Engine (Pixel-Diffing)
- [ ] CI/CD CLI for Automated Pipeline Gates
- [ ] Team Collaboration & Shared Dashboards
- [ ] Cloud-Managed Browser Execution
- [ ] Custom Plugin Architecture (MCP)

---

## 🤝 Contributing

We welcome contributions from the community!

1. **Fork** the repository.
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`.
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`.
4. **Push** to the branch: `git push origin feature/amazing-feature`.
5. **Open** a Pull Request.

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🔒 Security

For security vulnerabilities, please do not open an issue. Instead, email security@inspectra.test. We take security seriously and will respond within 24 hours.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 💬 Community

- **Motivation**: We believe testing should be as intelligent as the apps we build.
- **Vision**: To become the industry standard for AI-native autonomous quality assurance.
- **Join us**: [Discord](https://discord.gg/inspectra) | [Twitter/X](https://x.com/inspectra)

<div align="center">
  <br />
  Built with ❤️ by the Inspectra Team
</div>
