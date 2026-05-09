import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/auth/current-user.decorator";
import { JwtAuthGuard } from "@/common/auth/jwt-auth.guard";
import { ExportReportDto } from "@/modules/reports/dto/export-report.dto";
import { ReportsService } from "@/modules/reports/reports.service";
import type { PublicUser } from "@/types/domain";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  async list(@CurrentUser() user: PublicUser) {
    return await this.reports.list(user.id);
  }

  @Get(":id")
  async get(@CurrentUser() user: PublicUser, @Param("id") id: string) {
    return await this.reports.get(user.id, id);
  }

  @Post("export")
  async export(@CurrentUser() user: PublicUser, @Body() dto: ExportReportDto) {
    return await this.reports.export(user.id, dto.reportId, dto.format);
  }
}
