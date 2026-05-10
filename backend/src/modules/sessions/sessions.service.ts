import { Injectable, NotFoundException } from "@nestjs/common";
import { EventBusService } from "@/common/observability/event-bus.service";
import { LoggerService } from "@/common/observability/logger.service";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import { AiService } from "@/modules/ai/ai.service";
import { BrowserService } from "@/modules/browser/browser.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { ReportsService } from "@/modules/reports/reports.service";
import { ScreenshotsService } from "@/modules/screenshots/screenshots.service";
import { QueueService } from "@/queues/queue.service";
import { LocalStorageService } from "@/services/storage/local-storage.service";
import type { StartSessionDto } from "@/modules/sessions/dto/start-session.dto";
import type { Action, PublicUser, Session } from "@/types/domain";

@Injectable()
export class SessionsService {
  constructor(
    private readonly ai: AiService,
    private readonly browser: BrowserService,
    private readonly database: PostgresDatabaseService,
    private readonly events: EventBusService,
    private readonly logger: LoggerService,
    private readonly projects: ProjectsService,
    private readonly reports: ReportsService,
    private readonly screenshots: ScreenshotsService,
    private readonly queues: QueueService,
    private readonly storage: LocalStorageService,
  ) {}

  async start(user: PublicUser, dto: StartSessionDto) {
    const project = await this.projects.get(user.id, dto.projectId);
    const objective = await this.ai.extractIntent(dto.prompt);
    const now = this.database.now();
    const session = this.database.sessions.create({
      id: this.database.createId(),
      projectId: project.id,
      ownerId: user.id,
      prompt: dto.prompt,
      status: "created",
      objective,
      currentAction: "Creating autonomous agent",
      confidence: 0.72,
      startedAt: now,
      updatedAt: now,
    });
    await this.database.sessions.save(session);
    await this.queues.enqueue("browser", "session.start", { sessionId: session.id });

    const running = await this.updateSession(session.id, {
      status: "running",
      currentAction: "Initializing browser session",
    });
    this.events.emit({ type: "session_started", session: this.database.mapSession(running as any) });
    return running;
  }

  async get(userId: string, id: string) {
    const session = await this.database.sessions.findOneBy({ id });
    if (!session || session.ownerId !== userId) {
      throw new NotFoundException("Session not found");
    }

    const [actions, screenshots, aiLogs, sessionReports] = await Promise.all([
      this.database.listActions(id),
      this.database.listScreenshots(id),
      this.database.listAiLogs(id),
      this.database.reports.find({ where: { sessionId: id } }),
    ]);

    return {
      ...session,
      actions,
      screenshots,
      aiLogs,
      reports: sessionReports,
    };
  }

  async getLatest(userId: string) {
    const session = await this.database.sessions.findOne({
      where: { ownerId: userId },
      order: { startedAt: "DESC" },
    });
    if (!session) {
      throw new NotFoundException("No sessions found");
    }
    return this.get(userId, session.id);
  }

  async pause(userId: string, id: string) {
    await this.assertOwner(userId, id);
    const session = await this.updateSession(id, { status: "paused", currentAction: "Paused by user" });
    this.events.emit({ type: "session_paused", session: this.database.mapSession(session as any) });
    return session;
  }

  async resume(userId: string, id: string) {
    await this.assertOwner(userId, id);
    const session = await this.updateSession(id, { status: "running", currentAction: "Resumed execution" });
    this.events.emit({ type: "session_resumed", session: this.database.mapSession(session as any) });
    
    // If there's a pending action, it should be handled by the workflow loop
    return session;
  }

  async approveAction(userId: string, id: string, actionId: string) {
    await this.assertOwner(userId, id);
    const action = await this.database.actions.findOneBy({ id: actionId });
    if (!action) throw new NotFoundException("Action not found");
    
    action.status = "approved";
    await this.database.actions.save(action);
    
    // Resume session automatically on approval
    return this.resume(userId, id);
  }

  async stop(userId: string, id: string) {
    await this.assertOwner(userId, id);
    await this.browser.close(id);
    const session = await this.updateSession(id, {
      status: "stopped",
      currentAction: "Stopped by user",
      completedAt: this.database.now(),
    });
    this.events.emit({ type: "session_failed", session: this.database.mapSession(session as any) });
    return session;
  }

  private emitActionEvent(sessionId: string, action: Action) {
    if (action.type === "navigation") {
      this.events.emit({ type: "navigation", sessionId, action });
      return;
    }
    if (action.type === "click") {
      this.events.emit({ type: "click", sessionId, action });
      return;
    }
    if (action.type === "form_fill") {
      this.events.emit({ type: "form_fill", sessionId, action });
      return;
    }
    this.events.emit({ type: "browser_event", sessionId, action });
  }

  private async failSession(sessionId: string, reason: string) {
    const session = await this.updateSession(sessionId, {
      status: "failed",
      currentAction: reason,
      completedAt: this.database.now(),
    });
    this.logger.error(reason, sessionId);
    this.events.emit({ type: "session_failed", session: this.database.mapSession(session as any) });
  }

  private async assertOwner(userId: string, id: string) {
    const session = await this.requireSession(id);
    if (session.ownerId !== userId) {
      throw new NotFoundException("Session not found");
    }
  }

  private async requireSession(id: string) {
    const session = await this.database.sessions.findOneBy({ id });
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    return session;
  }

  private async updateSession(id: string, patch: Partial<any>) {
    const session = await this.requireSession(id);
    const updated = {
      ...session,
      ...patch,
      updatedAt: this.database.now(),
    };
    await this.database.sessions.save(updated);
    return updated;
  }
}
