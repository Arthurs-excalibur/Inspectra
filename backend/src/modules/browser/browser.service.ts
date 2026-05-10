import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { chromium, firefox, webkit, type Browser, type Page } from "playwright";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import { SecurityService } from "@/common/security/security.service";
import { LoggerService } from "@/common/observability/logger.service";
import type { Action, BrowserName, Project, Session } from "@/types/domain";

type BrowserSession = {
  browser: Browser;
  page: Page;
};

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private readonly sessions = new Map<string, BrowserSession>();

  constructor(
    private readonly config: ConfigService,
    private readonly database: PostgresDatabaseService,
    private readonly security: SecurityService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleDestroy() {
    await Promise.all([...this.sessions.values()].map((session) => session.browser.close()));
  }

  async launch(session: Session, project: Project) {
    const browserType = this.resolveBrowser(project.browser);
    const headless = this.config.get<boolean>("PLAYWRIGHT_HEADLESS") ?? true;
    
    this.logger.info(`[BROWSER] Launching ${project.browser} (headless: ${headless}) for session ${session.id}`, session.id);
    
    try {
      const browser = await browserType.launch({
        headless,
        channel: project.browser === "chromium" ? "chrome" : undefined,
      });
      
      this.logger.info(`[BROWSER] Started browser successfully`, session.id);

      const context = await browser.newContext({
        viewport: { width: 1440, height: 960 },
        userAgent: "Inspectra-Autonomous-QA/1.0",
      });
      const page = await context.newPage();
      this.sessions.set(session.id, { browser, page });
      return page;
    } catch (error: any) {
      this.logger.error(`[BROWSER] Failed to launch browser: ${error.message}`, session.id);
      
      const action = this.database.actions.create({
        id: this.database.createId(),
        sessionId: session.id,
        type: "recovery",
        label: `CRITICAL: Browser engine failed to start`,
        status: "failed",
        timestamp: this.database.now(),
        metadata: { error: error.message },
      });
      await this.database.actions.save(action);
      throw new Error(`Browser execution failed: ${error.message}`);
    }
  }

  async executeAction(sessionId: string, action: Omit<Action, "id" | "sessionId" | "timestamp" | "status">) {
    const created = this.database.actions.create({
      id: this.database.createId(),
      sessionId,
      status: "running",
      timestamp: this.database.now(),
      ...action,
    });
    await this.database.actions.save(created);

    try {
      const browserSession = this.sessions.get(sessionId);
      if (browserSession) {
        await this.runPlaywrightAction(sessionId, browserSession.page, created);
      }
      const updated = { ...created, status: "success" as const };
      await this.database.actions.save(updated);
      return updated;
    } catch (error) {
      const updated = {
        ...created,
        status: "failed" as const,
        metadata: {
          ...created.metadata,
          error: error instanceof Error ? error.message : "Unknown browser error",
        },
      };
      await this.database.actions.save(updated);
      return updated;
    }
  }

  async captureScreenshot(sessionId: string) {
    const browserSession = this.sessions.get(sessionId);
    if (!browserSession) {
      return Buffer.from("Inspectra screenshot placeholder", "utf8");
    }
    return browserSession.page.screenshot({ 
      type: "jpeg",
      quality: 60, // Optimized for streaming
      fullPage: false,
    });
  }

  async getDomSnapshot(sessionId: string) {
    const browserSession = this.sessions.get(sessionId);
    if (!browserSession) {
      return "No active browser session";
    }
    return browserSession.page.content();
  }

  async saveState(sessionId: string) {
    const browserSession = this.sessions.get(sessionId);
    if (!browserSession) return null;
    return browserSession.page.context().storageState();
  }

  async waitForStability(sessionId: string, timeout = 5000) {
    const browserSession = this.sessions.get(sessionId);
    if (!browserSession) return;

    const page = browserSession.page;
    try {
      await Promise.all([
        page.waitForLoadState("domcontentloaded", { timeout }),
        page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {}),
        // Wait for no DOM changes for 500ms
        page.waitForFunction(() => {
          return new Promise((resolve) => {
             let lastTime = Date.now();
             const observer = new MutationObserver(() => {
               lastTime = Date.now();
             });
             observer.observe(document.body, { childList: true, subtree: true, attributes: true });
             const interval = setInterval(() => {
               if (Date.now() - lastTime > 500) {
                 observer.disconnect();
                 clearInterval(interval);
                 resolve(true);
               }
             }, 100);
          });
        }, { timeout }).catch(() => {}),
      ]);
    } catch (error) {
      this.logger.warn(`Stability wait timed out for ${sessionId}`, "BrowserService");
    }
  }

  async close(sessionId: string) {
    const browserSession = this.sessions.get(sessionId);
    if (!browserSession) {
      return;
    }
    await browserSession.browser.close();
    this.sessions.delete(sessionId);
  }

  private async runPlaywrightAction(sessionId: string, page: Page, action: any) {
    const selector = String(action.metadata?.selector ?? "");
    const target = String(action.metadata?.target ?? "");
    const value = String(action.metadata?.value ?? "");

    switch (action.type) {
      case "navigation":
        if (target) {
          const validatedUrl = this.security.validateUrl(target);
          await page.goto(validatedUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
          await this.waitForStability(sessionId);
        }
        break;

      case "click":
        if (selector) {
          await page.click(selector, { timeout: 5000 });
          await this.waitForStability(sessionId);
        }
        break;

      case "form_fill":
      case "fill":
        if (selector) {
          await page.fill(selector, value, { timeout: 5000 });
        }
        break;

      case "press":
        if (value) {
          await page.keyboard.press(value);
        }
        break;

      case "scroll":
        await page.mouse.wheel(0, 600);
        break;

      case "assertion":
        // Basic presence assertion
        if (selector) {
          await page.waitForSelector(selector, { state: "visible", timeout: 5000 });
        }
        break;

      case "screenshot":
        // Logic handled by captureScreenshot
        break;
    }
  }

  private resolveBrowser(browser: BrowserName) {
    if (browser === "firefox") {
      return firefox;
    }
    if (browser === "webkit") {
      return webkit;
    }
    return chromium;
  }
}
