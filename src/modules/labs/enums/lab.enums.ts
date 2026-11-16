
export enum LabVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}
export enum LabMemberRole {
  OWNER = 'OWNER',
  VISITOR = 'VISITOR',
  RESEARCHER = 'RESEARCHER',
  
}

export const ASSIGNABLE_MEMBER_ROLES: LabMemberRole[] = [
  LabMemberRole.VISITOR,
  LabMemberRole.RESEARCHER,
  
];