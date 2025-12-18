import { OrgRole } from "@prisma/client";

export function hasOrgPermission(role: OrgRole, allowed: OrgRole[]) {
  return allowed.includes(role);
}

export const permissions = {
  MANAGE_ORG: ["OWNER", "ADMIN"],
  MANAGE_PROJECT: ["OWNER", "ADMIN", "PM"],
  WRITE_TASK: ["OWNER", "ADMIN", "PM", "MEMBER"],
  READ_CLIENT: ["OWNER", "ADMIN", "PM"],
};
