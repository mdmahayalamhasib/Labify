
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
} from "class-validator";

import { TaskStatus } from "@/common/enums/task-status.enum";

export class CreateTaskDto {
  @IsNotEmpty()
  @IsUUID()
  projectId: string = "";

  @IsNotEmpty()
  @IsUUID()
  milestoneId: string = "";

  @IsNotEmpty()
  @IsUUID()
  assigneeId: string = "";

  @IsNotEmpty()
  @IsString()
  title: string = "";

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
