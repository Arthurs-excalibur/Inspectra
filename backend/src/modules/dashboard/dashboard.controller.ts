import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/auth/current-user.decorator";
import { JwtAuthGuard } from "@/common/auth/jwt-auth.guard";
import { DashboardService } from "@/modules/dashboard/dashboard.service";
import type { PublicUser } from "@/types/domain";

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  async overview(@CurrentUser() user: PublicUser) {
    return await this.dashboard.getOverview(user.id);
  }
}
