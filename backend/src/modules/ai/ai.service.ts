import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import type { AiLog, Issue, Project, Session } from "@/types/domain";

export type ExecutionPlan = {
  objective: string;
  actions: Array<{
    type: "navigation" | "click" | "fill" | "press" | "scroll" | "screenshot" | "assertion";
    label: string;
    target?: string;
    selector?: string;
    value?: string;
    requiresApproval?: boolean;
  }>;
  risks: string[];
};

@Injectable()
export class AiService {
  constructor(
    private readonly config: ConfigService,
    private readonly database: PostgresDatabaseService,
  ) {}

  async extractIntent(prompt: string): Promise<string> {
    return prompt.trim().length > 0 ? prompt.trim() : "Run autonomous QA smoke test";
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

  private async callLlm(system: string, user: string, image?: Buffer): Promise<string> {
    const provider = this.config.get<string>("AI_PROVIDER");
    let url = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };

    if (provider === "ollama") {
      url = `${this.config.get("OLLAMA_BASE_URL")}/api/chat`;
    } else {
      url = `${this.config.get("OPENAI_COMPATIBLE_BASE_URL")}/chat/completions`;
      headers["Authorization"] = `Bearer ${this.config.get("OPENAI_COMPATIBLE_API_KEY")}`;
    }

    const messages: any[] = [
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

    const body = {
      model: this.config.get("AI_MODEL") ?? "gpt-4o",
      messages,
      stream: false,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(provider === "ollama" ? { ...body, model: "llama3-vision" } : body),
    });

    if (!resp.ok) {
      throw new Error(`AI Provider Error: ${resp.statusText}`);
    }

    const data = await resp.json();
    return provider === "ollama" ? data.message.content : data.choices[0].message.content;
  }

  private generateMockPlan(session: Session, project: Project): ExecutionPlan {
    const prompt = session.prompt.toLowerCase();
    const wantsMobile = prompt.includes("mobile");
    return {
      objective: session.objective,
      actions: [
        { type: "navigation", label: `Open ${project.baseUrl}`, target: project.baseUrl },
        { type: "assertion", label: "Verify page is reachable", selector: "body" },
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
