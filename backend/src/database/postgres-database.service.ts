import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "node:crypto";
import { UserEntity } from "./entities/user.entity";
import { ProjectEntity } from "./entities/project.entity";
import { SessionEntity } from "./entities/session.entity";
import { ActionEntity } from "./entities/action.entity";
import { ScreenshotEntity } from "./entities/screenshot.entity";
import { ReportEntity } from "./entities/report.entity";
import { IssueEntity } from "./entities/issue.entity";
import { AiLogEntity } from "./entities/ai-log.entity";
import { UserSettingsEntity } from "./entities/user-settings.entity";

@Injectable()
export class PostgresDatabaseService {
  constructor(
    @InjectRepository(UserEntity) public readonly users: Repository<UserEntity>,
    @InjectRepository(ProjectEntity) public readonly projects: Repository<ProjectEntity>,
    @InjectRepository(SessionEntity) public readonly sessions: Repository<SessionEntity>,
    @InjectRepository(ActionEntity) public readonly actions: Repository<ActionEntity>,
    @InjectRepository(ScreenshotEntity) public readonly screenshots: Repository<ScreenshotEntity>,
    @InjectRepository(ReportEntity) public readonly reports: Repository<ReportEntity>,
    @InjectRepository(IssueEntity) public readonly issues: Repository<IssueEntity>,
    @InjectRepository(AiLogEntity) public readonly aiLogs: Repository<AiLogEntity>,
    @InjectRepository(UserSettingsEntity) public readonly settings: Repository<UserSettingsEntity>,
  ) {}

  createId() {
    return randomUUID();
  }

  now() {
    return new Date();
  }

  publicUser(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }

  mapSession(session: SessionEntity) {
    return {
      id: session.id,
      projectId: session.projectId,
      ownerId: session.ownerId,
      prompt: session.prompt,
      status: session.status,
      objective: session.objective,
      currentAction: session.currentAction,
      confidence: Number(session.confidence),
      startedAt: session.startedAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      completedAt: session.completedAt?.toISOString(),
    };
  }

  mapAction(action: ActionEntity) {
    return {
      id: action.id,
      sessionId: action.sessionId,
      type: action.type,
      label: action.label,
      status: action.status,
      timestamp: action.timestamp.toISOString(),
      metadata: action.metadata,
    };
  }

  mapScreenshot(screenshot: ScreenshotEntity) {
    return {
      id: screenshot.id,
      sessionId: screenshot.sessionId,
      label: screenshot.label,
      path: screenshot.path,
      viewport: screenshot.viewport,
      annotationPath: screenshot.annotationPath,
      createdAt: screenshot.createdAt.toISOString(),
    };
  }

  mapReport(report: ReportEntity) {
    return {
      id: report.id,
      sessionId: report.sessionId,
      projectId: report.projectId,
      ownerId: report.ownerId,
      title: report.title,
      summary: report.summary,
      severity: report.severity,
      issueCount: report.issueCount,
      markdownPath: report.markdownPath,
      jsonPath: report.jsonPath,
      createdAt: report.createdAt.toISOString(),
    };
  }

  mapIssue(issue: IssueEntity) {
    return {
      id: issue.id,
      reportId: issue.reportId,
      sessionId: issue.sessionId,
      title: issue.title,
      severity: issue.severity,
      category: issue.category,
      confidence: Number(issue.confidence),
      reproductionSteps: issue.reproductionSteps,
      suggestedFix: issue.suggestedFix,
      screenshotIds: issue.screenshotIds,
    };
  }

  mapAiLog(log: AiLogEntity) {
    return {
      id: log.id,
      sessionId: log.sessionId,
      stage: log.stage,
      message: log.message,
      confidence: log.confidence ? Number(log.confidence) : undefined,
      timestamp: log.timestamp.toISOString(),
    };
  }

  mapSettings(settings: UserSettingsEntity) {
    return {
      userId: settings.userId,
      aiProvider: settings.aiProvider,
      model: settings.model,
      reasoningMode: settings.reasoningMode,
      temperature: Number(settings.temperature),
      headless: settings.headless,
      notifications: settings.notifications,
    };
  }

  async listProjects(ownerId: string) {
    return this.projects.find({
      where: { ownerId, archived: false },
      order: { createdAt: "DESC" },
    });
  }

  async listReports(ownerId: string) {
    return this.reports.find({
      where: { ownerId },
      order: { createdAt: "DESC" },
    });
  }

  async listIssues(reportId: string) {
    return this.issues.find({
      where: { reportId },
    });
  }

  async listActions(sessionId: string) {
    return this.actions.find({
      where: { sessionId },
      order: { timestamp: "ASC" },
    });
  }

  async listScreenshots(sessionId: string) {
    return this.screenshots.find({
      where: { sessionId },
      order: { createdAt: "ASC" },
    });
  }

  async listAiLogs(sessionId: string) {
    return this.aiLogs.find({
      where: { sessionId },
      order: { timestamp: "ASC" },
    });
  }
}
