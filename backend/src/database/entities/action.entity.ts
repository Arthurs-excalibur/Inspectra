import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { SessionEntity } from "./session.entity";

@Entity("actions")
export class ActionEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "session_id" })
  sessionId!: string;

  @ManyToOne(() => SessionEntity)
  @JoinColumn({ name: "session_id" })
  session!: SessionEntity;

  @Column()
  type!: "navigation" | "click" | "form_fill" | "assertion" | "scroll" | "hover" | "screenshot" | "recovery";

  @Column()
  label!: string;

  @Column()
  status!: "pending" | "running" | "success" | "failed" | "approved";

  @CreateDateColumn({ name: "timestamp" })
  timestamp!: Date;

  @Column("jsonb", { nullable: true })
  metadata!: any;
}
