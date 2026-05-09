import { IsArray, IsEnum, IsOptional, IsString, IsUrl, MinLength } from "class-validator";
import type { BrowserName } from "@/types/domain";

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsUrl({ require_tld: false })
  baseUrl!: string;

  @IsOptional()
  @IsString()
  framework?: string;

  @IsEnum(["none", "basic", "oauth", "session"])
  authMode!: "none" | "basic" | "oauth" | "session";

  @IsEnum(["chromium", "firefox", "webkit"])
  browser!: BrowserName;

  @IsArray()
  @IsString({ each: true })
  environments!: string[];

  @IsString()
  aiModel!: string;
}
