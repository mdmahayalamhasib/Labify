
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from "class-validator";

export class CreateEquipmentRuleDto {
  @IsNotEmpty()
  @IsUUID()
  equipmentId: string = "";

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string = "";

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
