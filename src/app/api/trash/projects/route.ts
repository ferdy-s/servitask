import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: orgId,
      role: { in: ["OWNER", "ADMIN"] },
      isActive: true,
    },
    select: { id: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await prisma.project.findMany({
    where: { organizationId: orgId, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    select: {
      id: true,
      name: true,
      deletedAt: true,
      deletedById: true,
    },
    take: 50,
  });

  return NextResponse.json(items);
}
