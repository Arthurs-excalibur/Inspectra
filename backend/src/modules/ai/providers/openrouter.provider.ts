import { AiMessage, AiCompletionOptions, AiProvider } from "./ai-provider.interface";

export class OpenRouterProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = "https://openrouter.ai/api/v1",
  ) {}

  async complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<string> {
    const maxRetries = 5;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI-PROVIDER] Calling OpenRouter: ${options?.model || "default"}`);
        console.log(`[AI-PROVIDER] Prompt Context: ${JSON.stringify(messages).substring(0, 200)}...`);

        const resp = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://inspectra.test",
            "X-Title": "Inspectra AI",
          },
          body: JSON.stringify({
            model: options?.model || "google/gemini-2.0-flash-lite-preview-02-05:free",
            messages,
            temperature: options?.temperature ?? 0.1,
            max_tokens: options?.maxTokens,
            stream: false,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          console.log(`[AI-PROVIDER] OpenRouter Success. Tokens: ${data.usage?.total_tokens || "unknown"}`);
          console.log(`[AI-PROVIDER] Response: ${data.choices[0].message.content.substring(0, 100)}...`);
          return data.choices[0].message.content;
        }

        const status = resp.status;
        const errorText = await resp.text();
        console.warn(`OpenRouter Attempt ${attempt} failed (${status}): ${errorText}`);

        if (status === 401 || status === 400) {
          throw new Error(`OpenRouter Fatal Error: ${status} ${errorText}`);
        }

        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error: any) {
        lastError = error;
        if (error.message?.includes("Fatal Error")) throw error;
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(`OpenRouter failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }
}
