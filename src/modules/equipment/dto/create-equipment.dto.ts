
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsEnum,
  MaxLength,
} from "class-validator";

import { EquipmentStatus } from "@/common/enums/equipment-status.enum";

export class CreateEquipmentDto {
  @IsNotEmpty()
  @IsUUID()
  labId: string = "";

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string = "";

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  equipmentType: string = "";

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;
}
