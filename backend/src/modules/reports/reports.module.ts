import { Module } from "@nestjs/common";
import { AiModule } from "@/modules/ai/ai.module";
import { ReportsController } from "@/modules/reports/reports.controller";
import { ReportsService } from "@/modules/reports/reports.service";

@Module({
  imports: [AiModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
