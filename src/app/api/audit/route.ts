import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

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

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);

  const logs = await prisma.auditLog.findMany({
    where: {
      organizationId: orgId,
      ...(q
        ? {
            OR: [
              { action: { contains: q, mode: "insensitive" } },
              { entityType: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
              { entityId: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      summary: true,
      actorRole: true,
      createdAt: true,
      actorUserId: true,
    },
  });

  return NextResponse.json(logs);
}
