import { Module } from "@nestjs/common";
import { AiModule } from "@/modules/ai/ai.module";
import { BrowserModule } from "@/modules/browser/browser.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { ReportsModule } from "@/modules/reports/reports.module";
import { ScreenshotsModule } from "@/modules/screenshots/screenshots.module";
import { StorageModule } from "@/services/storage/storage.module";
import { SessionsController } from "@/modules/sessions/sessions.controller";
import { SessionsService } from "@/modules/sessions/sessions.service";

@Module({
  imports: [AiModule, BrowserModule, ProjectsModule, ReportsModule, ScreenshotsModule, StorageModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
