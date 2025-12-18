import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;

  const session = await requireSession();
  const orgId = session.activeOrgId!;

  const comments = await prisma.taskComment.findMany({
    where: {
      taskId,
      task: { organizationId: orgId },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      taskId: true,
    },
  });

  return NextResponse.json(comments);
}
