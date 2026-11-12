
import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
} from "class-validator";

import { BookingStatus } from "@/common/enums/booking-status.enum";

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsUUID()
  reviewedById?: string;
}
