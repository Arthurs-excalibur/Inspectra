import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("user_settings")
export class UserSettingsEntity {
  @PrimaryColumn("uuid", { name: "user_id" })
  userId!: string;

  @OneToOne(() => UserEntity, (user) => user.settings)
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ name: "ai_provider" })
  aiProvider!: "mock" | "ollama" | "openai-compatible";

  @Column()
  model!: string;

  @Column({ name: "reasoning_mode" })
  reasoningMode!: "balanced" | "high" | "transparent";

  @Column("numeric")
  temperature!: number;

  @Column()
  headless!: boolean;

  @Column("jsonb", { default: {} })
  notifications!: any;
}
