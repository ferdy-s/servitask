import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;
  const body = await req.json();

  const { moduleId, enabled } = body as {
    moduleId: string;
    enabled: boolean;
  };

  // Pastikan hanya Owner/Admin
  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: orgId,
      role: { in: ["OWNER", "ADMIN"] },
      isActive: true,
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.organizationModule.upsert({
    where: {
      organizationId_moduleId: {
        organizationId: orgId,
        moduleId,
      },
    },
    update: { isEnabled: enabled },
    create: {
      organizationId: orgId,
      moduleId,
      isEnabled: enabled,
    },
  });

  return NextResponse.json({ ok: true });
}
