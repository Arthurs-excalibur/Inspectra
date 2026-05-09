import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { SessionEntity } from "./session.entity";

@Entity("screenshots")
export class ScreenshotEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "session_id" })
  sessionId!: string;

  @ManyToOne(() => SessionEntity)
  @JoinColumn({ name: "session_id" })
  session!: SessionEntity;

  @Column()
  label!: string;

  @Column()
  path!: string;

  @Column()
  viewport!: "desktop" | "tablet" | "mobile";

  @Column({ name: "annotation_path", nullable: true })
  annotationPath?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
