import { isEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LabVisibility } from '../enums/lab.enums';

export class CreateLabDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsOptional()
  @IsEnum(LabVisibility, {
    message: `visibility must be one of: ${Object.values(LabVisibility).join(', ')}`,
  })
  visibility?: LabVisibility;
}
