import { OnModuleInit } from "@nestjs/common";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { LoggerService } from "@/common/observability/logger.service";
import { EventBusService } from "@/common/observability/event-bus.service";
import { AiService, AgentAction } from "@/modules/ai/ai.service";
import { BrowserService } from "@/modules/browser/browser.service";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import { ScreenshotsService } from "@/modules/screenshots/screenshots.service";
import { ReportsService } from "@/modules/reports/reports.service";
import { LocalStorageService } from "@/services/storage/local-storage.service";
import { VisualRegressionService } from "@/services/visual-regression/visual-regression.service";

@Processor("browser")
export class WorkflowProcessor extends WorkerHost implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    private readonly events: EventBusService,
    private readonly ai: AiService,
    private readonly browser: BrowserService,
    private readonly database: PostgresDatabaseService,
    private readonly screenshots: ScreenshotsService,
    private readonly reports: ReportsService,
    private readonly storage: LocalStorageService,
    private readonly visual: VisualRegressionService,
  ) {
    super();
  }

  onModuleInit() {
    this.logger.info("[WORKER] Browser workflow processor initialized and ready for jobs.");
  }

  async process(job: Job<{ sessionId: string }>): Promise<any> {
    const { sessionId } = job.data;
    this.logger.info(`Starting workflow for session ${sessionId}`, sessionId);

    try {
      const session = await this.database.sessions.findOneBy({ id: sessionId });
      if (!session) throw new Error("Session not found");

      const project = await this.database.projects.findOneBy({ id: session.projectId });
      if (!project) throw new Error("Project not found");

      // 1. Launch Browser
      const page = await this.browser.launch(session as any, project as any);
      if (!page) throw new Error("Failed to launch browser");

      let step = 0;
      const MAX_STEPS = 25;
      let lastActionStatus = "success";
      const issues: any[] = [];

      // 2. Dynamic Execution Loop
      while (step < MAX_STEPS) {
        step++;
        
        await job.updateProgress(Math.floor((step / MAX_STEPS) * 100));
        this.events.emit({
          type: "workflow_progress",
          sessionId,
          step,
          totalSteps: MAX_STEPS,
          status: "Analyzing page state...",
        });
        const [screenshotBuffer, dom] = await Promise.all([
          this.browser.captureScreenshot(sessionId),
          this.browser.getDomSnapshot(sessionId),
        ]);

        // Broadcast frame to frontend
        this.events.emit({
          type: "screenshot_captured",
          sessionId,
          screenshot: { 
            id: "live", 
            sessionId, 
            path: `data:image/jpeg;base64,${screenshotBuffer.toString("base64")}`, 
            label: "Live Stream", 
            viewport: "desktop", 
            createdAt: new Date() 
          } as any,
        });

        // AI Thinks
        const action: AgentAction = await this.ai.nextStep(session as any, project as any, {
          screenshot: screenshotBuffer,
          dom,
          lastActionStatus,
        });

        // Log reasoning
        const log = await this.ai.createLog(sessionId, "action", action.label, 0.9);
        this.events.emit({ type: "reasoning_chunk", sessionId, log: this.database.mapAiLog(log) });

        if (action.type === "finish") {
          this.logger.info(`Session ${sessionId} completed goal: ${action.label}`, sessionId);
          break;
        }

        // Execute Action
        try {
          const executed = await this.browser.executeAction(sessionId, {
            type: action.type as any,
            label: action.label,
            metadata: action.metadata as any,
          });
          lastActionStatus = executed.status;
          
          this.events.emit({
            type: "browser_event",
            sessionId,
            action: this.database.mapAction(executed as any) as any,
          });
        } catch (error: any) {
          this.logger.error(`Action execution failed: ${error.message}`, sessionId);
          lastActionStatus = "failed";
        }

        // Check for Visual Regressions
        const baseline = await this.visual.findBaseline(project.id, action.label);
        if (baseline) {
          const baselineBuffer = await this.storage.readBuffer(baseline.path);
          const regression = await this.visual.compareScreenshots(screenshotBuffer, baselineBuffer, sessionId);
          
          if (regression.isDifferent) {
            this.logger.warn(`Visual regression detected for ${action.label}`, sessionId);
            const issue = {
              id: this.database.createId(),
              title: `Visual Regression: ${action.label}`,
              severity: "warning",
              category: "visual",
              confidence: 0.95,
              reproductionSteps: ["Run session", `Compare ${action.label} to baseline`],
              suggestedFix: "Review layout shifts in the screenshot diff.",
              screenshotIds: ["live"],
              metadata: { misMatchPercentage: regression.misMatchPercentage, diffPath: regression.diffPath },
            };
            issues.push(issue);
            this.events.emit({ type: "issue_detected", sessionId, issue: issue as any });
          }
        }

        // Check for issues every 3 steps
        if (step % 3 === 0) {
           const detectedIssues = await this.ai.analyzeObservation(session as any, screenshotBuffer, dom);
           if (detectedIssues.length > 0) {
             issues.push(...detectedIssues);
             detectedIssues.forEach(issue => {
                this.events.emit({ type: "issue_detected", sessionId, issue: issue as any });
             });
           }
        }

        // Graceful stop check
        const currentSession = await this.database.sessions.findOneBy({ id: sessionId });
        if (currentSession?.status === "stopped" || currentSession?.status === "failed") {
          break;
        }
      }

      // 3. Finalize
      await this.reports.generate(session as any, issues);
      await this.database.sessions.update(sessionId, {
        status: "completed",
        completedAt: new Date(),
        currentAction: "Workflow finished",
      });

      this.events.emit({ type: "session_completed", session: this.database.mapSession(session as any) });
      await this.browser.close(sessionId);

    } catch (error: any) {
      this.logger.error(`Workflow failed for ${sessionId}: ${error.message}`, sessionId);
      await this.database.sessions.update(sessionId, {
        status: "failed",
        currentAction: `Error: ${error.message}`,
        completedAt: new Date(),
      });
      await this.browser.close(sessionId);
      throw error;
    }
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
