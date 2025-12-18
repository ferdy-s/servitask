import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

async function checkClientAccess(
  userId: string,
  orgId: string,
  taskId: string
) {
  // role guard
  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId,
      organizationId: orgId,
      role: "CLIENT",
      isActive: true,
    },
  });
  if (!membership) return null;

  // client via email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user?.email) return null;

  const client = await prisma.client.findFirst({
    where: {
      organizationId: orgId,
      email: user.email,
    },
  });
  if (!client) return null;

  // pastikan task milik project client ini
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId: orgId,
      project: { clientId: client.id },
    },
  });

  return task ? { clientId: client.id } : null;
}

/* ================= GET COMMENTS ================= */
export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

  const access = await checkClientAccess(session.userId, orgId, params.taskId);

  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comments = await prisma.taskComment.findMany({
    where: { taskId: params.taskId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      isClient: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return NextResponse.json(comments);
}

/* ================= POST COMMENT ================= */
export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;
  const body = await req.json();

  if (!body?.content || body.content.trim().length < 2) {
    return NextResponse.json({ error: "Comment too short" }, { status: 400 });
  }

  const access = await checkClientAccess(session.userId, orgId, params.taskId);

  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await prisma.taskComment.create({
    data: {
      taskId: params.taskId,
      userId: session.userId,
      content: body.content.trim(),
      isClient: true,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
