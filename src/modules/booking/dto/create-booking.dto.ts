
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
} from "class-validator";

export class CreateBookingDto {
  @IsNotEmpty()
  @IsUUID()
  equipmentId: string = "";

  @IsNotEmpty()
  @IsDateString()
  startTime: string = "";

  @IsNotEmpty()
  @IsDateString()
  endTime: string = "";

  @IsOptional()
  @IsString()
  purpose?: string;
}
