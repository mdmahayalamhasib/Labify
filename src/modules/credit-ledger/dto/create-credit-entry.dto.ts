import {
  IsUUID,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
} from "class-validator";

export class CreateCreditEntryDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  amount!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsNotEmpty()
  refType!: string;

  @IsUUID()
  @IsOptional()
  refId?: string;
}