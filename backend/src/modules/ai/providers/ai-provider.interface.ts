export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
};

export type AiCompletionOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  image?: Buffer;
};

export interface AiProvider {
  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<string>;
}
