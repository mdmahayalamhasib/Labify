import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
} from "class-validator";

import { MilestoneStatus } from "@/common/enums/milestone-status.enum";

export class CreateMilestoneDto {
  @IsNotEmpty()
  @IsUUID()
  projectId: string = "";

  @IsNotEmpty()
  @IsString()
  title: string = "";

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;
}
export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;
}