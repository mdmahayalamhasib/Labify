// Author: Sazid Ahmed Ekram
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "@/modules/users/users.service";

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>("JWT_BEARER_SECRET");
    if (!secret)
      throw new Error("JWT_BEARER_SECRET must be set in the environment");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.usersService.findById(payload.sub);
      return {
        id: user.userId,
        email: user.email,
        role: user.role,
        roles: [user.role],
      };
    } catch {
      throw new UnauthorizedException("User account no longer exists");
    }
  }
}
