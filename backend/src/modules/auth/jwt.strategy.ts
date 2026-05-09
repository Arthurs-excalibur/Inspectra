import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PostgresDatabaseService } from "@/database/postgres-database.service";

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly database: PostgresDatabaseService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET") ?? "inspectra-local-development-secret-change-me",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.database.users.findOneBy({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException("Invalid token subject");
    }
    return this.database.publicUser(user);
  }
}
