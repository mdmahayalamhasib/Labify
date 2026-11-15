import { IsUUID, IsEnum, IsString, IsOptional } from 'class-validator';

export class CreateLabCapabilityDto {
  @IsUUID()
  tagId!: string;

  @IsEnum(['OFFER', 'NEED'])
  kind!: 'OFFER' | 'NEED';

  @IsOptional()
  @IsString()
  note?: string;
}