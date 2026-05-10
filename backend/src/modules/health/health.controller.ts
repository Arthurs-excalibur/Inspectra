import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/auth/jwt-auth.guard";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import { ConfigService } from "@nestjs/config";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { BrowserService } from "@/modules/browser/browser.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly database: PostgresDatabaseService,
    private readonly config: ConfigService,
    private readonly browser: BrowserService,
    @InjectQueue("browser") private readonly browserQueue: Queue,
  ) {}

  @Get("diagnostics")
  @UseGuards(JwtAuthGuard)
  async getDiagnostics() {
    const start = Date.now();
    
    // Check DB
    let dbStatus = "healthy";
    try {
      await this.database.users.count();
    } catch (e) {
      dbStatus = "unhealthy";
    }

    // Check Redis / Queue
    let redisStatus = "healthy";
    let waitingJobs = 0;
    try {
      waitingJobs = await this.browserQueue.count();
    } catch (e) {
      redisStatus = "unhealthy";
    }

    // Check AI Provider
    const aiProvider = this.config.get("AI_PROVIDER") || "openrouter";
    const apiKeySet = !!this.config.get("OPENROUTER_API_KEY");

    return {
      status: "ok",
      latency: Date.now() - start,
      timestamp: new Date().toISOString(),
      reality_check: {
        database: { status: dbStatus, type: "PostgreSQL" },
        redis: { status: redisStatus, waiting_jobs: waitingJobs },
        ai: { provider: aiProvider, configured: apiKeySet },
        browser: { engine: "Playwright/Chromium", active_sessions: 0 }, // Would need tracking in service
      }
    };
  }
}
