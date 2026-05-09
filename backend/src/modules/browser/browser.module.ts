import { Module } from "@nestjs/common";
import { BrowserService } from "@/modules/browser/browser.service";

@Module({
  providers: [BrowserService],
  exports: [BrowserService],
})
export class BrowserModule {}
