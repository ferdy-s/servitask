import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { OrgRole } from "@prisma/client";
import { hasOrgPermission } from "./rbac";

export async function requireOrgAccess(allowedRoles: OrgRole[]) {
  const session = await getSession();
  if (!session || !session.activeOrgId) {
    throw new Error("UNAUTHORIZED");
  }

  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: session.activeOrgId,
      isActive: true,
    },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  if (!hasOrgPermission(membership.role, allowedRoles)) {
    throw new Error("FORBIDDEN");
  }

  return {
    session,
    role: membership.role,
    organizationId: session.activeOrgId,
  };
}
