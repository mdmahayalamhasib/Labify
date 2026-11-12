import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
// Accept role strings so each module can use its own small role enum.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
