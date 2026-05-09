import { Module } from "@nestjs/common";
import { BrowserModule } from "@/modules/browser/browser.module";
import { ScreenshotsService } from "@/modules/screenshots/screenshots.service";
import { VisualRegressionService } from "@/modules/screenshots/visual-regression.service";

@Module({
  imports: [BrowserModule],
  providers: [ScreenshotsService, VisualRegressionService],
  exports: [ScreenshotsService, VisualRegressionService],
})
export class ScreenshotsModule {}
