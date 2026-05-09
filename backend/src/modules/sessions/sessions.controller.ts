import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/auth/current-user.decorator";
import { JwtAuthGuard } from "@/common/auth/jwt-auth.guard";
import { StartSessionDto } from "@/modules/sessions/dto/start-session.dto";
import { SessionsService } from "@/modules/sessions/sessions.service";
import type { PublicUser } from "@/types/domain";

@Controller("sessions")
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post("start")
  async start(@CurrentUser() user: PublicUser, @Body() dto: StartSessionDto) {
    return await this.sessions.start(user, dto);
  }

  @Post(":id/pause")
  async pause(@CurrentUser() user: PublicUser, @Param("id") id: string) {
    return await this.sessions.pause(user.id, id);
  }

  @Post(":id/resume")
  async resume(@CurrentUser() user: PublicUser, @Param("id") id: string) {
    return await this.sessions.resume(user.id, id);
  }

  @Post(":id/stop")
  async stop(@CurrentUser() user: PublicUser, @Param("id") id: string) {
    return await this.sessions.stop(user.id, id);
  }

  @Post(":id/approve/:actionId")
  async approve(@CurrentUser() user: PublicUser, @Param("id") id: string, @Param("actionId") actionId: string) {
    return await this.sessions.approveAction(user.id, id, actionId);
  }

  @Get(":id")
  async get(@CurrentUser() user: PublicUser, @Param("id") id: string) {
    return await this.sessions.get(user.id, id);
  }
}
