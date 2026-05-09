import { Injectable } from "@nestjs/common";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import type { UpdateSettingsDto } from "@/modules/settings/dto/update-settings.dto";
import type { UserSettings } from "@/types/domain";

@Injectable()
export class SettingsService {
  constructor(private readonly database: PostgresDatabaseService) {}

  async get(userId: string) {
    return this.ensureSettings(userId);
  }

  async update(userId: string, dto: UpdateSettingsDto) {
    const current = await this.ensureSettings(userId);
    const updated = {
      ...current,
      ...dto,
      notifications: {
        ...current.notifications,
        ...dto.notifications,
      },
    };
    await this.database.settings.save(updated as any);
    return updated;
  }

  private async ensureSettings(userId: string) {
    const existing = await this.database.settings.findOneBy({ userId });
    if (existing) {
      return existing;
    }

    const settings = this.database.settings.create({
      userId,
      aiProvider: "mock",
      model: "inspectra-mock-agent",
      reasoningMode: "transparent",
      temperature: 0.2,
      headless: true,
      notifications: {
        desktop: true,
      },
    });
    await this.database.settings.save(settings);
    return settings;
  }
}
