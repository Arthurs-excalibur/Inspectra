import { IsEnum, IsString } from "class-validator";

export class ExportReportDto {
  @IsString()
  reportId!: string;

  @IsEnum(["markdown", "json", "pdf-ready", "github", "jira"])
  format!: "markdown" | "json" | "pdf-ready" | "github" | "jira";
}
