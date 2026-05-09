import { Injectable } from "@nestjs/common";

export type McpToolName = "browser" | "filesystem" | "screenshot" | "github" | "terminal";

@Injectable()
export class McpService {
  listTools() {
    return [
      { name: "browser", enabled: true, description: "Controls Playwright browser sessions" },
      { name: "filesystem", enabled: true, description: "Stores reports, assets, logs, and traces" },
      { name: "screenshot", enabled: true, description: "Captures, compares, and annotates screenshots" },
      { name: "github", enabled: false, description: "Future GitHub issue export integration" },
      { name: "terminal", enabled: false, description: "Optional advanced automation" },
    ];
  }

  resolveTool(name: McpToolName) {
    return this.listTools().find((tool) => tool.name === name);
  }
}
