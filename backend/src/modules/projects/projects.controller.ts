import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/auth/current-user.decorator";
import { JwtAuthGuard } from "@/common/auth/jwt-auth.guard";
import { CreateProjectDto } from "@/modules/projects/dto/create-project.dto";
import { UpdateProjectDto } from "@/modules/projects/dto/update-project.dto";
import { ProjectsService } from "@/modules/projects/projects.service";
import type { PublicUser } from "@/types/domain";

@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  async list(@CurrentUser() user: PublicUser) {
    return await this.projects.list(user.id);
  }

  @Post()
  async create(@CurrentUser() user: PublicUser, @Body() dto: CreateProjectDto) {
    return await this.projects.create(user.id, dto);
  }

  @Get(":id")
  async get(@CurrentUser() user: PublicUser, @Param("id") id: string) {
    return await this.projects.get(user.id, id);
  }

  @Patch(":id")
  async update(@CurrentUser() user: PublicUser, @Param("id") id: string, @Body() dto: UpdateProjectDto) {
    return await this.projects.update(user.id, id, dto);
  }

  @Delete(":id")
  async archive(@CurrentUser() user: PublicUser, @Param("id") id: string) {
    return await this.projects.archive(user.id, id);
  }
}
