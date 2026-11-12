
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
} from "class-validator";

import { BookingStatus } from "@/common/enums/booking-status.enum";

export class CreateBookingDto {
  @IsNotEmpty()
  @IsUUID()
  equipmentId: string = "";

  @IsNotEmpty()
  @IsUUID()
  userId: string = "";

  @IsNotEmpty()
  @IsDateString()
  startTime: string = "";

  @IsNotEmpty()
  @IsDateString()
  endTime: string = "";

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
