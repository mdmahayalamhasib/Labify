import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCapabilityTagDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;
}