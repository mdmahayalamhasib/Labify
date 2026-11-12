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

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword({ minLength: 8 })
  password!: string;

  // Public registration defaults to researcher; an admin may choose another role.
  @IsOptional()
  @IsEnum(AccountRole)
  role?: AccountRole;
}
