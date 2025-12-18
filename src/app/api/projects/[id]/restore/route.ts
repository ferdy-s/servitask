import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // WAJIB: await params
  const { id } = await context.params;

  const session = await requireSession();
  const orgId = session.activeOrgId!;

  // RBAC: hanya OWNER / ADMIN
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
    where: {
      id,
      organizationId: orgId,
    },
    select: {
      id: true,
      name: true,
      deletedAt: true,
    },
  });

  if (!project || !project.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Restore project + tasks
  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });

    await tx.task.updateMany({
      where: {
        organizationId: orgId,
        projectId: id,
        deletedAt: { not: null },
      },
      data: {
        deletedAt: null,
        deletedById: null,
      },
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
