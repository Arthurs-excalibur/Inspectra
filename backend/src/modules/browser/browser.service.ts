import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { chromium, firefox, webkit, type Browser, type Page } from "playwright";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
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
  ) {}

  async onModuleDestroy() {
    await Promise.all([...this.sessions.values()].map((session) => session.browser.close()));
  }

  async launch(session: Session, project: Project) {
    const browserType = this.resolveBrowser(project.browser);
    try {
      const browser = await browserType.launch({
        headless: this.config.get<boolean>("PLAYWRIGHT_HEADLESS") ?? true,
      });
      const context = await browser.newContext({
        viewport: { width: 1440, height: 960 },
        recordVideo: undefined,
      });
      const page = await context.newPage();
      this.sessions.set(session.id, { browser, page });
      return page;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown Playwright launch error";
      const action = this.database.actions.create({
        id: this.database.createId(),
        sessionId: session.id,
        type: "recovery",
        label: "Playwright browser unavailable; continuing with simulated browser stream",
        status: "success",
        timestamp: this.database.now(),
        metadata: { reason },
      });
      await this.database.actions.save(action);
      return undefined;
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
        await this.runPlaywrightAction(browserSession.page, created);
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
    return browserSession.page.screenshot({ fullPage: true });
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

  async close(sessionId: string) {
    const browserSession = this.sessions.get(sessionId);
    if (!browserSession) {
      return;
    }
    await browserSession.browser.close();
    this.sessions.delete(sessionId);
  }

  private async runPlaywrightAction(page: Page, action: any) {
    const selector = String(action.metadata?.selector ?? "");
    const target = String(action.metadata?.target ?? "");
    const value = String(action.metadata?.value ?? "");

    switch (action.type) {
      case "navigation":
        if (target) {
          await page.goto(target, { waitUntil: "domcontentloaded", timeout: 15_000 });
        }
        break;

      case "click":
        if (selector) {
          await page.click(selector, { timeout: 5000 });
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
