import { Injectable, NotFoundException } from "@nestjs/common";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import type { CreateProjectDto } from "@/modules/projects/dto/create-project.dto";
import type { UpdateProjectDto } from "@/modules/projects/dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly database: PostgresDatabaseService) {}

  async list(ownerId: string) {
    return this.database.listProjects(ownerId);
  }

  async create(ownerId: string, dto: CreateProjectDto) {
    const now = this.database.now();
    const project = this.database.projects.create({
      id: this.database.createId(),
      ownerId,
      name: dto.name,
      baseUrl: dto.baseUrl,
      framework: dto.framework,
      authMode: dto.authMode,
      browser: dto.browser,
      environments: dto.environments,
      aiModel: dto.aiModel,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
    await this.database.projects.save(project);
    return project;
  }

  async get(ownerId: string, id: string) {
    const project = await this.database.projects.findOneBy({ id });
    if (!project || project.ownerId !== ownerId || project.archived) {
      throw new NotFoundException("Project not found");
    }
    return project;
  }

  async update(ownerId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.get(ownerId, id);
    const updated = {
      ...project,
      ...dto,
      updatedAt: this.database.now(),
    };
    await this.database.projects.save(updated);
    return updated;
  }

  async archive(ownerId: string, id: string) {
    const project = await this.get(ownerId, id);
    const updated = {
      ...project,
      archived: true,
      updatedAt: this.database.now(),
    };
    await this.database.projects.save(updated);
    return { ok: true };
  }
}
