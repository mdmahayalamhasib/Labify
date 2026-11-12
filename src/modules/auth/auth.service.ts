// Author: Sazid Ahmed Ekram
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AccountRole } from "@/common/enums/account-role.enum";
import { toSafeUser, UsersService } from "@/modules/users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Public registration must never allow someone to create an administrator.
    if (dto.role === AccountRole.ADMIN) {
      throw new BadRequestException(
        "Administrator accounts must be created by an admin",
      );
    }
    return this.usersService.create({
      ...dto,
      role: dto.role ?? AccountRole.RESEARCHER,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordMatches = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    // Use the same response for an unknown email and an incorrect password.
    if (!user || !passwordMatches) {
      throw new UnauthorizedException("Email or password is incorrect");
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.userId,
      email: user.email,
      role: user.role,
    });

    return { accessToken, user: toSafeUser(user) };
  }
}
