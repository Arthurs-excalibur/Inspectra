import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import { AiProvider, AiMessage } from "./providers/ai-provider.interface";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { OllamaProvider } from "./providers/ollama.provider";
import type { AiLog, Issue, Project, Session } from "@/types/domain";

export type AgentAction = {
  type: "navigation" | "click" | "fill" | "press" | "scroll" | "screenshot" | "assertion" | "wait" | "finish";
  label: string;
  metadata?: {
    target?: string;
    selector?: string;
    value?: string;
    timeout?: number;
    reason?: string;
  };
  requiresApproval?: boolean;
};

export type ExecutionPlan = {
  objective: string;
  actions: AgentAction[];
  risks: string[];
};

@Injectable()
export class AiService {
  constructor(
    private readonly config: ConfigService,
    private readonly database: PostgresDatabaseService,
  ) {}

  async extractIntent(prompt: string): Promise<string> {
    const sanitized = prompt.replace(/[<>]/g, "").trim();
    return sanitized.length > 0 ? sanitized : "Run autonomous QA smoke test";
  }

  async createPlan(session: Session, project: Project): Promise<ExecutionPlan> {
    const provider = this.config.get<string>("AI_PROVIDER");
    if (provider === "mock") {
      return this.generateMockPlan(session, project);
    }

    const systemPrompt = `You are Inspectra, an autonomous QA agent. 
Given a user objective and a project URL, generate a JSON execution plan.
Format: { "objective": string, "actions": [{ "type": string, "label": string, "target": string, "selector": string, "value": string, "requiresApproval": boolean }], "risks": string[] }
Valid types: navigation, click, fill, press, scroll, screenshot, assertion.
IMPORTANT: Set "requiresApproval": true for high-risk actions (e.g. clicking "Delete", "Submit Payment", "Purchase", or destructive state changes).`;

    const userPrompt = `Project: ${project.name} (${project.baseUrl})
Objective: ${session.prompt}`;

    try {
      const response = await this.callLlm(systemPrompt, userPrompt);
      return JSON.parse(response) as ExecutionPlan;
    } catch (error) {
      console.error("AI Plan Generation Error:", error);
      return this.generateMockPlan(session, project);
    }
  }

  async createLog(sessionId: string, stage: AiLog["stage"], message: string, confidence?: number) {
    const log = this.database.aiLogs.create({
      id: this.database.createId(),
      sessionId,
      stage,
      message,
      confidence,
      timestamp: this.database.now(),
    });
    await this.database.aiLogs.save(log);
    return log;
  }

  async analyzeObservation(session: Session, screenshotBuffer?: Buffer, domSnapshot?: string): Promise<Issue[]> {
    const provider = this.config.get<string>("AI_PROVIDER");
    if (provider === "mock") {
      return this.generateMockIssue(session);
    }

    const systemPrompt = `You are Inspectra's Vision Core. 
Analyze the provided screenshot and DOM snapshot for QA issues (bugs, layout shifts, accessibility violations, or logic errors).
Return a JSON array of Issues.
Issue Format: { "title": string, "severity": "critical"|"warning"|"info", "category": "visual"|"logic"|"performance", "confidence": number, "reproductionSteps": string[], "suggestedFix": string }`;

    const userPrompt = `Project Objective: ${session.objective}
Current Status: ${session.currentAction}
DOM Highlights: ${domSnapshot?.slice(0, 5000) ?? "No DOM data"}`;

    try {
      const response = await this.callLlm(systemPrompt, userPrompt, screenshotBuffer);
      return JSON.parse(response) as Issue[];
    } catch (error) {
      console.error("AI Observation Error:", error);
      return this.generateMockIssue(session);
    }
  }

  private getProvider(): AiProvider {
    const provider = this.config.get<string>("AI_PROVIDER");
    if (provider === "openai-compatible" || provider === "openrouter") {
      return new OpenRouterProvider(
        this.config.get<string>("OPENAI_COMPATIBLE_API_KEY") || "",
        this.config.get<string>("OPENAI_COMPATIBLE_BASE_URL"),
      );
    }
    if (provider === "ollama") {
      return new OllamaProvider(this.config.get<string>("OLLAMA_BASE_URL"));
    }
    // Fallback or other providers...
    throw new Error(`AI Provider ${provider} not implemented`);
  }

  async nextStep(
    session: Session,
    project: Project,
    observation: { screenshot?: Buffer; dom?: string; lastActionStatus?: string },
  ): Promise<AgentAction> {
    const provider = this.getProvider();
    
    const systemPrompt = `You are Inspectra, an autonomous QA agent.
Goal: ${session.objective}
Project: ${project.name} (${project.baseUrl})

Instructions:
1. Analyze the current DOM and screenshot.
2. Decide the NEXT best action to achieve the goal.
3. If the goal is reached or an unrecoverable error occurs, use type: "finish".
4. For high-risk actions (payment, delete), set "requiresApproval": true.
5. Return ONLY a JSON object representing the action.

Action Format:
{ 
  "type": "navigation"|"click"|"fill"|"press"|"scroll"|"screenshot"|"assertion"|"wait"|"finish",
  "label": "Human readable description",
  "metadata": { "target": "URL", "selector": "CSS/XPath", "value": "text", "reason": "why" },
  "requiresApproval": boolean 
}`;

    const userPrompt = `Current Action History: ${session.currentAction}
Last Action Status: ${observation.lastActionStatus ?? "unknown"}
DOM Snapshot (truncated): ${observation.dom?.slice(0, 10000)}
What is the next step?`;

    const messages: AiMessage[] = [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: observation.screenshot 
          ? [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: `data:image/png;base64,${observation.screenshot.toString("base64")}` } }
            ]
          : userPrompt 
      },
    ];

    try {
      const response = await provider.complete(messages, { model: this.config.get("AI_MODEL") });
      // Clean up JSON if LLM added markdown blocks
      const cleanJson = response.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson) as AgentAction;
    } catch (error: any) {
      console.error("AI NextStep Error:", error);
      return { type: "finish", label: "AI Reasoning failed, stopping session.", metadata: { reason: error.message } };
    }
  }

  private async callLlm(system: string, user: string, image?: Buffer): Promise<string> {
    const provider = this.getProvider();
    const messages: AiMessage[] = [
      { role: "system", content: system },
      { 
        role: "user", 
        content: image 
          ? [
              { type: "text", text: user },
              { type: "image_url", image_url: { url: `data:image/png;base64,${image.toString("base64")}` } }
            ]
          : user 
      },
    ];

    return provider.complete(messages, { model: this.config.get("AI_MODEL") });
  }

  private generateMockPlan(session: Session, project: Project): ExecutionPlan {
    const prompt = session.prompt.toLowerCase();
    const wantsMobile = prompt.includes("mobile");
    return {
      objective: session.objective,
      actions: [
        { type: "navigation", label: `Open ${project.baseUrl}`, metadata: { target: project.baseUrl } },
        { type: "assertion", label: "Verify page is reachable", metadata: { selector: "body" } },
        { type: "screenshot", label: wantsMobile ? "Capture mobile viewport" : "Capture desktop viewport" },
      ],
      risks: ["network timeout"],
    };
  }

  private generateMockIssue(session: Session): Issue[] {
    return [{
      id: this.database.createId(),
      reportId: "pending",
      sessionId: session.id,
      title: "Potential layout regression detected",
      severity: "warning",
      category: "visual",
      confidence: 0.75,
      reproductionSteps: ["Open the target application.", "Navigate to the tested flow."],
      suggestedFix: "Review the latest screenshots for visual inconsistencies.",
      screenshotIds: [],
    }];
  }

  async writeExecutiveSummary(session: Session, issues: Issue[]) {
    const provider = this.config.get<string>("AI_PROVIDER") ?? "mock";
    const issueText = issues.length === 1 ? "1 issue" : `${issues.length} issues`;
    return `Using the ${provider} reasoning pipeline, Inspectra completed "${session.objective}" and detected ${issueText}.`;
  }
}
