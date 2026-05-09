import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { ProjectEntity } from "./project.entity";
import { SessionEntity } from "./session.entity";
import { IssueEntity } from "./issue.entity";

@Entity("reports")
export class ReportEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "session_id" })
  sessionId!: string;

  @ManyToOne(() => SessionEntity)
  @JoinColumn({ name: "session_id" })
  session!: SessionEntity;

  @Column({ name: "project_id" })
  projectId!: string;

  @ManyToOne(() => ProjectEntity)
  @JoinColumn({ name: "project_id" })
  project!: ProjectEntity;

  @Column({ name: "owner_id" })
  ownerId!: string;

  @ManyToOne(() => UserEntity, (user) => user.reports)
  @JoinColumn({ name: "owner_id" })
  owner!: UserEntity;

  @Column()
  title!: string;

  @Column()
  summary!: string;

  @Column()
  severity!: "critical" | "warning" | "info";

  @Column({ name: "issue_count" })
  issueCount!: number;

  @Column({ name: "markdown_path" })
  markdownPath!: string;

  @Column({ name: "json_path" })
  jsonPath!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => IssueEntity, (issue) => issue.report)
  issues!: IssueEntity[];
}
