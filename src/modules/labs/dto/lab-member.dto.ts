import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class AddLabMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  memberRole: string; 

  @IsOptional()
  @IsString()
  supervisorName?: string;
}