import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { HealthController } from "./health.controller";
import { BrowserModule } from "@/modules/browser/browser.module";

@Module({
  imports: [
    BullModule.registerQueue({ name: "browser" }),
    BrowserModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
