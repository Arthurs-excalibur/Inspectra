import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "@/modules/auth/auth.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { SessionsModule } from "@/modules/sessions/sessions.module";
import { ReportsModule } from "@/modules/reports/reports.module";
import { HealthModule } from "@/modules/health/health.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { DashboardModule } from "@/modules/dashboard/dashboard.module";
import { AiModule } from "@/modules/ai/ai.module";
import { BrowserModule } from "@/modules/browser/browser.module";
import { ScreenshotsModule } from "@/modules/screenshots/screenshots.module";
import { McpModule } from "@/modules/mcp/mcp.module";
import { RealtimeModule } from "@/modules/realtime/realtime.module";
import { DatabaseModule } from "@/database/database.module";
import { QueuesModule } from "@/queues/queues.module";
import { StorageModule } from "@/services/storage/storage.module";
import { ObservabilityModule } from "@/common/observability/observability.module";
import { SecurityModule } from "@/common/security/security.module";
import { VisualRegressionModule } from "@/services/visual-regression/visual-regression.module";
import { GatewaysModule } from "@/common/gateways/gateways.module";
import { validateConfig } from "@/config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    ObservabilityModule,
    SecurityModule,
    VisualRegressionModule,
    GatewaysModule,
    DatabaseModule,
    QueuesModule,
    StorageModule,
    RealtimeModule,
    AuthModule,
    DashboardModule,
    ProjectsModule,
    AiModule,
    BrowserModule,
    ScreenshotsModule,
    McpModule,
    ReportsModule,
    HealthModule,
    SettingsModule,
    SessionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
