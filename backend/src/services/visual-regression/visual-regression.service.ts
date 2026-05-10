import { Injectable } from "@nestjs/common";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { LocalStorageService } from "@/services/storage/local-storage.service";
import { PostgresDatabaseService } from "@/database/postgres-database.service";

export type DiffResult = {
  misMatchPercentage: number;
  isDifferent: boolean;
  diffPath?: string;
};

@Injectable()
export class VisualRegressionService {
  constructor(
    private readonly storage: LocalStorageService,
    private readonly database: PostgresDatabaseService,
  ) {}

  async compareScreenshots(
    currentBuffer: Buffer,
    baselineBuffer: Buffer,
    sessionId: string,
  ): Promise<DiffResult> {
    const currentImg = PNG.sync.read(currentBuffer);
    const baselineImg = PNG.sync.read(baselineBuffer);
    const { width, height } = currentImg;

    if (width !== baselineImg.width || height !== baselineImg.height) {
      return { misMatchPercentage: 100, isDifferent: true };
    }

    const diff = new PNG({ width, height });
    const diffPixels = pixelmatch(
      currentImg.data,
      baselineImg.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 },
    );

    const misMatchPercentage = (diffPixels / (width * height)) * 100;
    const isDifferent = misMatchPercentage > 0.05; // 0.05% threshold

    let diffPath: string | undefined;
    if (isDifferent) {
      const diffBuffer = PNG.sync.write(diff);
      const filename = `${sessionId}-${Date.now()}.png`;
      await this.storage.writeBuffer("diffs", filename, diffBuffer);
      diffPath = `diffs/${filename}`;
    }

    return { misMatchPercentage, isDifferent, diffPath };
  }

  async findBaseline(projectId: string, label: string) {
    // In a real app, this would query a "Golden Baseline" table
    // For now, we'll find the last successful screenshot with the same label
    const sessionIds = (await this.database.sessions.find({ 
      where: { projectId, status: "completed" },
      order: { completedAt: "DESC" },
      take: 5
    })).map(s => s.id);

    if (sessionIds.length === 0) return null;

    const baseline = await this.database.screenshots.findOne({
      where: { label }, // Simplified: finding by label
      order: { createdAt: "DESC" }
    });

    return baseline;
  }
}
