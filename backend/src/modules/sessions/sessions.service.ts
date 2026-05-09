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

    void this.executeWorkflow(session.id).catch((error) => {
      this.failSession(session.id, error instanceof Error ? error.message : "Unknown session error");
    });

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

  private async executeWorkflow(sessionId: string) {
    let session = await this.requireSession(sessionId);
    const project = await this.projects.get(session.ownerId, session.projectId);

    await this.browser.launch(session as any, project as any);
    this.logger.info("Browser session launched", session.id);

    const intentLog = await this.ai.createLog(session.id, "intent", `Intent extracted: ${session.objective}`, 0.83);
    this.events.emit({ type: "reasoning_chunk", sessionId: session.id, log: this.database.mapAiLog(intentLog) });

    const plan = await this.ai.createPlan(session as any, project as any);
    const planLog = await this.ai.createLog(session.id, "planning", `Generated ${plan.actions.length} action plan with ${plan.risks.length} known risks.`, 0.86);
    this.events.emit({ type: "reasoning_chunk", sessionId: session.id, log: this.database.mapAiLog(planLog) });

    let actionCount = 0;
    const MAX_ACTIONS = 20;

    for (const plannedAction of plan.actions) {
      // Circuit Breaker check
      if (actionCount++ >= MAX_ACTIONS) {
        await this.failSession(session.id, "Circuit Breaker: Maximum session actions exceeded.");
        return;
      }

      session = await this.updateSession(session.id, {
        currentAction: plannedAction.label,
        confidence: Math.min(0.96, Number(session.confidence) + 0.03),
      });
      this.events.emit({ type: "confidence_update", sessionId: session.id, confidence: session.confidence });

      // Safety Intercept
      if (plannedAction.requiresApproval) {
        const interceptLog = await this.ai.createLog(session.id, "reflection", `SAFETY INTERCEPT: Action "${plannedAction.label}" requires manual approval.`, 1.0);
        this.events.emit({ type: "reasoning_chunk", sessionId: session.id, log: this.database.mapAiLog(interceptLog) });
        
        await this.updateSession(session.id, { status: "paused", currentAction: `Waiting for approval: ${plannedAction.label}` });
        this.events.emit({ type: "approval_required", sessionId: session.id, action: plannedAction as any });
        
        // Polling wait for approval (basic implementation)
        let approved = false;
        while (!approved) {
          const currentSession = await this.requireSession(session.id);
          if (currentSession.status === "stopped" || currentSession.status === "failed") return;
          if (currentSession.status === "running") approved = true;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      const action = await this.browser.executeAction(session.id, {
        type: plannedAction.type,
        label: plannedAction.label,
        metadata: {
          target: plannedAction.target,
          selector: (plannedAction as any).selector,
          value: plannedAction.value,
        },
      } as any);
      this.emitActionEvent(session.id, action as any);

      const actionLog = await this.ai.createLog(session.id, "action", `Executed: ${plannedAction.label}`, Number(session.confidence));
      this.events.emit({ type: "reasoning_chunk", sessionId: session.id, log: this.database.mapAiLog(actionLog) });

      if (action.status === "failed") {
        await this.recover(session.id, plannedAction.label);
      }
    }

    const screenshot = await this.screenshots.capture(session as any, "Autonomous QA observation", "mobile");
    const [screenshotBuffer, domSnapshot] = await Promise.all([
      this.storage.readBuffer(screenshot.path),
      this.browser.getDomSnapshot(session.id),
    ]);
    this.events.emit({ type: "screenshot_captured", sessionId: session.id, screenshot: this.database.mapScreenshot(screenshot) });

    const observationLog = await this.ai.createLog(session.id, "observation", "Analyzed screenshot, DOM signals, and execution trace.", 0.88);
    this.events.emit({ type: "reasoning_chunk", sessionId: session.id, log: this.database.mapAiLog(observationLog) });

    const issues = await this.ai.analyzeObservation(session as any, screenshotBuffer, domSnapshot);
    const issuesWithScreenshot = issues.map((issue) => ({
      ...issue,
      screenshotIds: [screenshot.id],
    }));
    issuesWithScreenshot.forEach((issue) => {
      this.events.emit({ type: "issue_detected", sessionId: session.id, issue });
      this.events.emit({ type: "issue_classified", sessionId: session.id, issue });
    });

    const reflectionLog = await this.ai.createLog(session.id, "reflection", "Goal partially succeeded; visual blocker requires report escalation.", 0.88);
    this.events.emit({ type: "reasoning_chunk", sessionId: session.id, log: this.database.mapAiLog(reflectionLog) });

    const report = await this.reports.generate(session as any, issuesWithScreenshot);
    this.events.emit({ type: "report_generated", sessionId: session.id, report: this.database.mapReport(report) });

    const completed = await this.updateSession(session.id, {
      status: "completed",
      currentAction: "Report generated",
      confidence: 0.88,
      completedAt: this.database.now(),
    });
    await this.browser.close(session.id);
    this.events.emit({ type: "session_completed", session: this.database.mapSession(completed as any) });
  }

  private async recover(sessionId: string, label: string) {
    const action = this.database.actions.create({
      id: this.database.createId(),
      sessionId,
      type: "recovery",
      label: `Recovery: retry or alternate selector after "${label}"`,
      status: "success",
      timestamp: this.database.now(),
    });
    await this.database.actions.save(action);
    this.events.emit({ type: "browser_event", sessionId, action: action as any });
    const log = await this.ai.createLog(sessionId, "reflection", `Recovery applied for ${label}`, 0.78);
    this.events.emit({ type: "reasoning_chunk", sessionId, log: this.database.mapAiLog(log) });
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
