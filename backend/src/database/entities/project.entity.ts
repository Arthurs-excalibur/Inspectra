import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { SessionEntity } from "./session.entity";

@Entity("projects")
export class ProjectEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "owner_id" })
  ownerId!: string;

  @ManyToOne(() => UserEntity, (user) => user.projects)
  @JoinColumn({ name: "owner_id" })
  owner!: UserEntity;

  @Column()
  name!: string;

  @Column({ name: "base_url" })
  baseUrl!: string;

  @Column({ nullable: true })
  framework!: string;

  @Column({ name: "auth_mode" })
  authMode!: "none" | "basic" | "oauth" | "session";

  @Column()
  browser!: "chromium" | "firefox" | "webkit";

  @Column("jsonb", { default: [] })
  environments!: string[];

  @Column({ name: "ai_model" })
  aiModel!: string;

  @Column({ default: false })
  archived!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => SessionEntity, (session) => session.project)
  sessions!: SessionEntity[];
}
