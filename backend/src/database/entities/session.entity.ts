import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { ProjectEntity } from "./project.entity";

@Entity("sessions")
export class SessionEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "project_id" })
  projectId!: string;

  @ManyToOne(() => ProjectEntity, (project) => project.sessions)
  @JoinColumn({ name: "project_id" })
  project!: ProjectEntity;

  @Column({ name: "owner_id" })
  ownerId!: string;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  @JoinColumn({ name: "owner_id" })
  owner!: UserEntity;

  @Column()
  prompt!: string;

  @Column()
  status!: "created" | "running" | "paused" | "completed" | "failed" | "stopped";

  @Column()
  objective!: string;

  @Column({ name: "current_action" })
  currentAction!: string;

  @Column("numeric")
  confidence!: number;

  @CreateDateColumn({ name: "started_at" })
  startedAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt!: Date | null;

  @Column("jsonb", { name: "storage_state", nullable: true })
  storageState!: any;
}

