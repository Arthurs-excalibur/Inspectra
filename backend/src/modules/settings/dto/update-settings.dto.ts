import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsEnum(["mock", "ollama", "openai-compatible"])
  aiProvider?: "mock" | "ollama" | "openai-compatible";

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsEnum(["balanced", "high", "transparent"])
  reasoningMode?: "balanced" | "high" | "transparent";

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @IsOptional()
  @IsBoolean()
  headless?: boolean;

  @IsOptional()
  @IsObject()
  notifications?: {
    desktop?: boolean;
    webhook?: string;
    discord?: string;
    slack?: string;
  };
}
