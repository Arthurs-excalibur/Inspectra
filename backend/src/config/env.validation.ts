type RawConfig = Record<string, unknown>;

export type AppConfig = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  STORAGE_DIR: string;
  AI_PROVIDER: "mock" | "ollama" | "openai-compatible";
  OPENAI_COMPATIBLE_BASE_URL?: string;
  OPENAI_COMPATIBLE_API_KEY?: string;
  OLLAMA_BASE_URL: string;
  PLAYWRIGHT_HEADLESS: boolean;
  FRONTEND_ORIGIN: string;
};

export function validateConfig(config: RawConfig): AppConfig {
  return {
    NODE_ENV: readEnum(config.NODE_ENV, ["development", "test", "production"], "development"),
    PORT: Number(config.PORT ?? 4000),
    JWT_SECRET: String(config.JWT_SECRET ?? "inspectra-local-development-secret-change-me"),
    JWT_EXPIRES_IN: String(config.JWT_EXPIRES_IN ?? "1d"),
    DATABASE_URL: optionalString(config.DATABASE_URL),
    REDIS_URL: optionalString(config.REDIS_URL),
    STORAGE_DIR: String(config.STORAGE_DIR ?? "./storage"),
    AI_PROVIDER: readEnum(config.AI_PROVIDER, ["mock", "ollama", "openai-compatible"], "mock"),
    OPENAI_COMPATIBLE_BASE_URL: optionalString(config.OPENAI_COMPATIBLE_BASE_URL),
    OPENAI_COMPATIBLE_API_KEY: optionalString(config.OPENAI_COMPATIBLE_API_KEY),
    OLLAMA_BASE_URL: String(config.OLLAMA_BASE_URL ?? "http://localhost:11434"),
    PLAYWRIGHT_HEADLESS: String(config.PLAYWRIGHT_HEADLESS ?? "true") === "true",
    FRONTEND_ORIGIN: String(config.FRONTEND_ORIGIN ?? "http://localhost:3000"),
  };
}

function optionalString(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

function readEnum<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  const text = String(value ?? fallback);
  return options.includes(text as T) ? (text as T) : fallback;
}
