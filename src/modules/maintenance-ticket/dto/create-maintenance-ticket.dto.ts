
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from "class-validator";

import { MaintenancePriority } from "@/common/enums/maintenance-priority.enum";

export class CreateMaintenanceTicketDto {
  @IsNotEmpty()
  @IsUUID()
  equipmentId: string = "";

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string = "";

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  @IsDateString()
  downtimeStart?: string;

  @IsOptional()
  @IsDateString()
  downtimeEnd?: string;
}
