import { IsOptional, IsString, MinLength } from "class-validator";

export class StartSessionDto {
  @IsString()
  projectId!: string;

  @IsString()
  @MinLength(4)
  prompt!: string;

  @IsOptional()
  @IsString()
  environment?: string;
}
