import { Module } from "@nestjs/common";
import { RealtimeGateway } from "@/modules/realtime/realtime.gateway";

@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
