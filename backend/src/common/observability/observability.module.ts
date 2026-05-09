import { Global, Module } from "@nestjs/common";
import { EventBusService } from "@/common/observability/event-bus.service";
import { LoggerService } from "@/common/observability/logger.service";

@Global()
@Module({
  providers: [EventBusService, LoggerService],
  exports: [EventBusService, LoggerService],
})
export class ObservabilityModule {}
