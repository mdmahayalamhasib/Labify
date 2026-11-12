// Author: Sazid Ahmed Ekram
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { RolesGuard } from "@/common/guard/roles.guard";
import { JwtAuthGuard } from "@/common/guard/jwt-auth.guard";
import { UsersModule } from "@/modules/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_BEARER_SECRET");
        if (!secret)
          throw new Error("JWT_BEARER_SECRET must be set in the environment");
        const ttl = Number(config.get<string>("JWT_TTL") ?? "86400");
        return { secret, signOptions: { expiresIn: ttl } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
