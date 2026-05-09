import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany, OneToOne } from "typeorm";
import { ProjectEntity } from "./project.entity";
import { SessionEntity } from "./session.entity";
import { ReportEntity } from "./report.entity";
import { UserSettingsEntity } from "./user-settings.entity";

@Entity("users")
export class UserEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => ProjectEntity, (project) => project.owner)
  projects!: ProjectEntity[];

  @OneToMany(() => SessionEntity, (session) => session.owner)
  sessions!: SessionEntity[];

  @OneToMany(() => ReportEntity, (report) => report.owner)
  reports!: ReportEntity[];

  @OneToOne(() => UserSettingsEntity, (settings) => settings.user)
  settings!: UserSettingsEntity;
}
