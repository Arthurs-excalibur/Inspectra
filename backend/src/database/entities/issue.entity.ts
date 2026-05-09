import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { ReportEntity } from "./report.entity";
import { SessionEntity } from "./session.entity";

@Entity("issues")
export class IssueEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "report_id" })
  reportId!: string;

  @ManyToOne(() => ReportEntity, (report) => report.issues)
  @JoinColumn({ name: "report_id" })
  report!: ReportEntity;

  @Column({ name: "session_id" })
  sessionId!: string;

  @ManyToOne(() => SessionEntity)
  @JoinColumn({ name: "session_id" })
  session!: SessionEntity;

  @Column()
  title!: string;

  @Column()
  severity!: "critical" | "warning" | "info";

  @Column()
  category!: "functional" | "accessibility" | "visual" | "ux" | "performance";

  @Column("numeric")
  confidence!: number;

  @Column("jsonb", { name: "reproduction_steps", default: [] })
  reproductionSteps!: string[];

  @Column({ name: "suggested_fix" })
  suggestedFix!: string;

  @Column("jsonb", { name: "screenshot_ids", default: [] })
  screenshotIds!: string[];
}
