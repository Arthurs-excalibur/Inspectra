import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { UserEntity } from "./entities/user.entity";
import { ProjectEntity } from "./entities/project.entity";
import { SessionEntity } from "./entities/session.entity";
import { ActionEntity } from "./entities/action.entity";
import { ScreenshotEntity } from "./entities/screenshot.entity";
import { ReportEntity } from "./entities/report.entity";
import { IssueEntity } from "./entities/issue.entity";
import { AiLogEntity } from "./entities/ai-log.entity";
import { UserSettingsEntity } from "./entities/user-settings.entity";
import { PostgresDatabaseService } from "./postgres-database.service";

const entities = [
  UserEntity,
  ProjectEntity,
  SessionEntity,
  ActionEntity,
  ScreenshotEntity,
  ReportEntity,
  IssueEntity,
  AiLogEntity,
  UserSettingsEntity,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.get<string>("DATABASE_URL"),
        entities,
        synchronize: config.get<string>("NODE_ENV") === "development",
        logging: config.get<string>("NODE_ENV") === "development",
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [PostgresDatabaseService],
  exports: [TypeOrmModule, PostgresDatabaseService],
})
export class DatabaseModule {}
