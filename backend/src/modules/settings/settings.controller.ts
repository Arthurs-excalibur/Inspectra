import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/auth/current-user.decorator";
import { JwtAuthGuard } from "@/common/auth/jwt-auth.guard";
import { UpdateSettingsDto } from "@/modules/settings/dto/update-settings.dto";
import { SettingsService } from "@/modules/settings/settings.service";
import type { PublicUser } from "@/types/domain";

@Controller("settings")
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  async get(@CurrentUser() user: PublicUser) {
    return await this.settings.get(user.id);
  }

  @Patch()
  async update(@CurrentUser() user: PublicUser, @Body() dto: UpdateSettingsDto) {
    return await this.settings.update(user.id, dto);
  }
}
