import { Module } from "@nestjs/common";
import { McpService } from "@/modules/mcp/mcp.service";

@Module({
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
