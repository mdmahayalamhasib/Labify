// Author: Sazid Ahmed Ekram
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";
import { AccountRole } from "@/common/enums/account-role.enum";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword({ minLength: 8 })
  password!: string;

  @IsOptional()
  @IsEnum(AccountRole)
  role?: AccountRole;
}
