import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;
  const { id } = await context.params;

  // RBAC (OWNER / ADMIN / PM)
  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: orgId,
      role: { in: ["OWNER", "ADMIN", "PM"] },
      isActive: true,
    },
    select: { role: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId: orgId,
      deletedAt: null,
    },
    select: { id: true, name: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Soft delete project + tasks
  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: session.userId,
      },
    });

    await tx.task.updateMany({
      where: {
        organizationId: orgId,
        projectId: id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedById: session.userId,
      },
    });
  });

  await logAudit({
    organizationId: orgId,
    actorUserId: session.userId,
    actorRole: membership.role,
    action: "PROJECT_SOFT_DELETE",
    entityType: "Project",
    entityId: project.id,
    summary: `Project soft-deleted: ${project.name}`,
    meta: { projectId: project.id },
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
