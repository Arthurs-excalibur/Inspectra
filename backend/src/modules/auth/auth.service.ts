import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { PostgresDatabaseService } from "@/database/postgres-database.service";
import type { PublicUser, UserSettings } from "@/types/domain";
import type { LoginDto } from "@/modules/auth/dto/login.dto";
import type { RegisterDto } from "@/modules/auth/dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly database: PostgresDatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.database.users.findOneBy({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const user = this.database.users.create({
      id: this.database.createId(),
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash: await hash(dto.password, 12),
      createdAt: this.database.now(),
    });
    await this.database.users.save(user);
    
    const settings = this.database.settings.create(this.defaultSettings(user.id));
    await this.database.settings.save(settings);

    return this.issueToken(this.database.publicUser(user as any));
  }

  async login(dto: LoginDto) {
    const user = await this.database.users.findOneBy({ email: dto.email.toLowerCase() });
    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issueToken(this.database.publicUser(user as any));
  }

  logout() {
    return { ok: true };
  }

  issueToken(user: PublicUser) {
    return {
      user,
      accessToken: this.jwt.sign({
        sub: user.id,
        email: user.email,
      }),
    };
  }

  private defaultSettings(userId: string): UserSettings {
    return {
      userId,
      aiProvider: "mock",
      model: "inspectra-mock-agent",
      reasoningMode: "transparent",
      temperature: 0.2,
      headless: true,
      notifications: {
        desktop: true,
      },
    };
  }
}
