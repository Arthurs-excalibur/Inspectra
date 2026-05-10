import { Global, Module } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";
import { ObservabilityModule } from "@/common/observability/observability.module";

@Global()
@Module({
  imports: [ObservabilityModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class GatewaysModule {}
