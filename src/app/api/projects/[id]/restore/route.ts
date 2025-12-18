import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

  // RBAC: OWNER/ADMIN saja untuk restore
  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: orgId,
      role: { in: ["OWNER", "ADMIN"] },
      isActive: true,
    },
    select: { role: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, organizationId: orgId },
    select: { id: true, name: true, deletedAt: true },
  });

  if (!project || !project.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: params.id },
      data: { deletedAt: null, deletedById: null },
    });

    // Restore tasks yang ikut soft delete
    await tx.task.updateMany({
      where: {
        organizationId: orgId,
        projectId: params.id,
        deletedAt: { not: null },
      },
      data: { deletedAt: null, deletedById: null },
    });
  });

  await logAudit({
    organizationId: orgId,
    actorUserId: session.userId,
    actorRole: membership.role,
    action: "PROJECT_RESTORE",
    entityType: "Project",
    entityId: project.id,
    summary: `Project restored: ${project.name}`,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
