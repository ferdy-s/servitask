import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

  const modules = await prisma.module.findMany({
    include: {
      organizationModules: {
        where: { organizationId: orgId },
        select: { id: true, isEnabled: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = modules.map((m) => ({
    id: m.id,
    key: m.key,
    name: m.name,
    isEnabled: m.organizationModules[0]?.isEnabled ?? false,
  }));

  return NextResponse.json(result);
}
