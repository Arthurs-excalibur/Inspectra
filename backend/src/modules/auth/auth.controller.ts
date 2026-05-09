import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/auth/current-user.decorator";
import { JwtAuthGuard } from "@/common/auth/jwt-auth.guard";
import { AuthService } from "@/modules/auth/auth.service";
import { LoginDto } from "@/modules/auth/dto/login.dto";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import type { PublicUser } from "@/types/domain";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout() {
    return this.auth.logout();
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: PublicUser) {
    return user;
  }
}
