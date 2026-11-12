
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  MaxLength,
} from "class-validator";

import { MaintenanceStatus } from "@/common/enums/maintenance-status.enum";
import { MaintenancePriority } from "@/common/enums/maintenance-priority.enum";

export class CreateMaintenanceTicketDto {
  @IsNotEmpty()
  @IsUUID()
  equipmentId: string = "";

  @IsNotEmpty()
  @IsUUID()
  reportedById: string = "";

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string = "";

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;
}
