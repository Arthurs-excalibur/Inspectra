import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { QueueService } from "@/queues/queue.service";
import { WorkflowProcessor } from "./workflow.processor";
import { AiModule } from "@/modules/ai/ai.module";
import { BrowserModule } from "@/modules/browser/browser.module";
import { ScreenshotsModule } from "@/modules/screenshots/screenshots.module";
import { ReportsModule } from "@/modules/reports/reports.module";
import { StorageModule } from "@/services/storage/storage.module";
import { VisualRegressionModule } from "@/services/visual-regression/visual-regression.module";
import { DatabaseModule } from "@/database/database.module";
import { ObservabilityModule } from "@/common/observability/observability.module";

@Global()
@Module({
  imports: [
    AiModule,
    BrowserModule,
    ScreenshotsModule,
    ReportsModule,
    StorageModule,
    VisualRegressionModule,
    DatabaseModule,
    ObservabilityModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get("REDIS_URL"),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: "browser",
    }),
  ],
  providers: [QueueService, WorkflowProcessor],
  exports: [QueueService, BullModule],
})
export class QueuesModule {}
