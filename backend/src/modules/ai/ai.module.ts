import { Module } from "@nestjs/common";
import { AiService } from "@/modules/ai/ai.service";

@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
