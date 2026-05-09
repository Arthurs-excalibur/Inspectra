import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { SessionEntity } from "./session.entity";

@Entity("ai_logs")
export class AiLogEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "session_id" })
  sessionId!: string;

  @ManyToOne(() => SessionEntity)
  @JoinColumn({ name: "session_id" })
  session!: SessionEntity;

  @Column()
  stage!: "intent" | "planning" | "action" | "observation" | "reflection" | "reporting";

  @Column()
  message!: string;

  @Column("numeric", { nullable: true })
  confidence!: number;

  @CreateDateColumn({ name: "timestamp" })
  timestamp!: Date;
}
