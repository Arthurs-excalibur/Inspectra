import { AiMessage, AiCompletionOptions, AiProvider } from "./ai-provider.interface";

export class OllamaProvider implements AiProvider {
  constructor(private readonly baseUrl: string = "http://localhost:11434") {}

  async complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<string> {
    try {
      const resp = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: options?.model || "llama3-vision",
          messages: this.mapMessages(messages),
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.1,
          },
        }),
      });

      if (!resp.ok) {
        throw new Error(`Ollama Provider Error: ${resp.statusText}`);
      }

      const data = await resp.json();
      return data.message.content;
    } catch (error) {
      console.error("Ollama Provider Error:", error);
      throw error;
    }
  }

  private mapMessages(messages: AiMessage[]) {
    return messages.map((m) => {
      if (typeof m.content === "string") return m;
      
      // Ollama expects images as a separate 'images' field in the message
      const textContent = m.content
        .filter((c) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");
      
      const images = m.content
        .filter((c) => c.type === "image_url")
        .map((c: any) => {
           // Base64 only, no data:image/png;base64, prefix
           return c.image_url.url.split(",")[1];
        });

      return {
        role: m.role,
        content: textContent,
        images: images.length > 0 ? images : undefined,
      };
    });
  }
}
