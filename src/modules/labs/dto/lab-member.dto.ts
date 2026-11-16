import { IsString, IsNotEmpty, IsUUID, IsOptional, IsIn } from 'class-validator';
import { ASSIGNABLE_MEMBER_ROLES, LabMemberRole } from '../enums/lab.enums';

export class AddLabMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsIn(ASSIGNABLE_MEMBER_ROLES, {
    message: `memberRole must be one of: ${ASSIGNABLE_MEMBER_ROLES.join(', ')}`,
  })
  memberRole!: LabMemberRole;

  @IsOptional()
  @IsString()
  supervisorName?: string;
}