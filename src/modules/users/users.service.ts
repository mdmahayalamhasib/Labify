// Author: Sazid Ahmed Ekram
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { AccountRole } from "@/common/enums/account-role.enum";

const PASSWORD_SALT_ROUNDS = 10;

// One safe response shape is used everywhere so password hashes never escape.
export function toSafeUser(user: User) {
  return {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const user = this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS),
      role: dto.role ?? AccountRole.RESEARCHER,
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      return toSafeUser(savedUser);
    } catch (error) {
      if (this.isDuplicateEmail(error)) {
        throw new ConflictException(
          "An account with this email already exists",
        );
      }
      throw error;
    }
  }

  // AuthService needs the password hash only for the credential comparison.
  findByEmail(email: string) {
    return this.usersRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("LOWER(user.email) = LOWER(:email)", { email })
      .getOne();
  }

  async findById(userId: string) {
    const user = await this.usersRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException("User not found");
    return toSafeUser(user);
  }

  async findAll(page: number, limit: number) {
    const [users, total] = await this.usersRepository.findAndCount({
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users.map(toSafeUser),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException("User not found");

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.email !== undefined) user.email = dto.email.toLowerCase();
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    }

    try {
      return toSafeUser(await this.usersRepository.save(user));
    } catch (error) {
      if (this.isDuplicateEmail(error)) {
        throw new ConflictException(
          "An account with this email already exists",
        );
      }
      throw error;
    }
  }

  async remove(userId: string) {
    const user = await this.usersRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException("User not found");
    await this.usersRepository.remove(user);
    return { message: "User deleted successfully" };
  }

  private isDuplicateEmail(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    );
  }
}
