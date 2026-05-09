import { Injectable, NotFoundException } from "@nestjs/common";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import { AiService } from "@/modules/ai/ai.service";
import { LocalStorageService } from "@/services/storage/local-storage.service";
import type { Issue, Report, Session } from "@/types/domain";

@Injectable()
export class ReportsService {
  constructor(
    private readonly ai: AiService,
    private readonly database: PostgresDatabaseService,
    private readonly storage: LocalStorageService,
  ) {}

  async list(ownerId: string) {
    const reports = await this.database.listReports(ownerId);
    return Promise.all(
      reports.map(async (report) => ({
        ...this.database.mapReport(report),
        issues: (await this.database.listIssues(report.id)).map((i) => this.database.mapIssue(i)),
      })),
    );
  }

  async get(ownerId: string, id: string) {
    const report = await this.database.reports.findOneBy({ id });
    if (!report || report.ownerId !== ownerId) {
      throw new NotFoundException("Report not found");
    }
    const [issues, actions, screenshots, aiLogs] = await Promise.all([
      this.database.listIssues(report.id),
      this.database.listActions(report.sessionId),
      this.database.listScreenshots(report.sessionId),
      this.database.listAiLogs(report.sessionId),
    ]);
    return {
      ...this.database.mapReport(report),
      issues: issues.map((i) => this.database.mapIssue(i)),
      actions: actions.map((a) => this.database.mapAction(a)),
      screenshots: screenshots.map((s) => this.database.mapScreenshot(s)),
      aiLogs: aiLogs.map((l) => this.database.mapAiLog(l)),
    };
  }

  async generate(session: Session, issues: Issue[]) {
    const summary = await this.ai.writeExecutiveSummary(session, issues);
    const severity = this.highestSeverity(issues);
    const reportId = this.database.createId();
    const linkedIssues = issues.map((issue) => ({
      ...issue,
      id: this.database.createId(),
      reportId,
    }));

    const markdown = this.renderMarkdown(session, summary, linkedIssues);
    const [actions, screenshots, aiLogs] = await Promise.all([
      this.database.listActions(session.id),
      this.database.listScreenshots(session.id),
      this.database.listAiLogs(session.id),
    ]);
    const json = {
      session,
      summary,
      issues: linkedIssues,
      actions,
      screenshots,
      aiLogs,
    };
    const markdownPath = await this.storage.writeText("reports", `${reportId}.md`, markdown);
    const jsonPath = await this.storage.writeJson("reports", `${reportId}.json`, json);

    const report = this.database.reports.create({
      id: reportId,
      sessionId: session.id,
      projectId: session.projectId,
      ownerId: session.ownerId,
      title: `Inspectra Report: ${session.objective}`,
      summary,
      severity,
      issueCount: linkedIssues.length,
      markdownPath,
      jsonPath,
      createdAt: this.database.now(),
    });
    await this.database.reports.save(report);
    
    const issueEntities = linkedIssues.map(issue => this.database.issues.create(issue as any));
    await this.database.issues.save(issueEntities as any);
    
    return report;
  }

  async export(ownerId: string, reportId: string, format: string) {
    const report = await this.get(ownerId, reportId);
    if (format === "github") {
      return {
        target: "github",
        title: report.title,
        body: report.summary,
        labels: ["qa", "inspectra", report.severity],
      };
    }
    if (format === "jira") {
      return {
        target: "jira",
        summary: report.title,
        description: report.summary,
        issueType: "Bug",
      };
    }
    return {
      format,
      report,
    };
  }

  private renderMarkdown(session: Session, summary: string, issues: Issue[]) {
    const issueMarkdown = issues
      .map((issue) => {
        const steps = issue.reproductionSteps.map((step, index) => `${index + 1}. ${step}`).join("\n");
        return `## ${issue.title}\n\nSeverity: ${issue.severity}\nConfidence: ${Math.round(issue.confidence * 100)}%\n\n### Reproduction\n${steps}\n\n### Suggested Fix\n${issue.suggestedFix}`;
      })
      .join("\n\n");

    return `# Inspectra QA Report\n\nSession: ${session.id}\nObjective: ${session.objective}\n\n## Executive Summary\n${summary}\n\n${issueMarkdown}`;
  }

  private highestSeverity(issues: Issue[]) {
    if (issues.some((issue) => issue.severity === "critical")) {
      return "critical" as const;
    }
    if (issues.some((issue) => issue.severity === "warning")) {
      return "warning" as const;
    }
    return "info" as const;
  }
}
