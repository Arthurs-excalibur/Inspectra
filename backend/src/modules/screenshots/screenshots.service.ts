import { Injectable } from "@nestjs/common";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import { BrowserService } from "@/modules/browser/browser.service";
import { LocalStorageService } from "@/services/storage/local-storage.service";
import { VisualRegressionService } from "@/modules/screenshots/visual-regression.service";
import type { Screenshot, Session } from "@/types/domain";

@Injectable()
export class ScreenshotsService {
  constructor(
    private readonly browser: BrowserService,
    private readonly database: PostgresDatabaseService,
    private readonly storage: LocalStorageService,
    private readonly visual: VisualRegressionService,
  ) {}

  async capture(session: Session, label: string, viewport: Screenshot["viewport"] = "desktop") {
    const buffer = await this.browser.captureScreenshot(session.id);
    const filename = `${session.id}-${Date.now()}.png`;
    const path = await this.storage.writeBuffer("screenshots", filename, buffer);
    const annotationPath = await this.storage.writeText(
      "annotations",
      `${session.id}-${Date.now()}.json`,
      JSON.stringify({
        label,
        highlights: [
          {
            x: 72,
            y: 68,
            width: 18,
            height: 10,
            severity: "critical",
            reason: "Potential overlap detected",
          },
        ],
      }),
    );

    const screenshot = this.database.screenshots.create({
      id: this.database.createId(),
      sessionId: session.id,
      label,
      path,
      viewport,
      annotationPath,
      createdAt: this.database.now(),
    });
    await this.database.screenshots.save(screenshot);
    return screenshot;
  }

  async compare(beforeId: string, afterId: string) {
    const [before, after] = await Promise.all([
      this.database.screenshots.findOneBy({ id: beforeId }),
      this.database.screenshots.findOneBy({ id: afterId }),
    ]);

    if (!before || !after) {
      throw new Error("Screenshots not found for comparison");
    }

    const [beforeBuffer, afterBuffer] = await Promise.all([
      this.storage.readBuffer(before.path),
      this.storage.readBuffer(after.path),
    ]);

    const result = await this.visual.compare(beforeBuffer, afterBuffer);
    const filename = `diff-${beforeId}-${afterId}.png`;
    const diffPath = await this.storage.writeBuffer("screenshots", filename, result.diffBuffer);

    return {
      beforeId,
      afterId,
      diffPath,
      mismatchedPixels: result.mismatchedPixels,
      diffScore: result.diffScore,
      isMatch: result.isMatch,
      confidence: 1 - result.diffScore,
    };
  }
}
