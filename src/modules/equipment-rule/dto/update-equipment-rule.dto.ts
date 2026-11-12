
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from "class-validator";

export class UpdateEquipmentRuleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxBookingMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  advanceBookingDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
