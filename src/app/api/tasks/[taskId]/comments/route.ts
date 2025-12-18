import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgAccess } from "@/lib/require-org-access";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    // ===============================
    // AUTH & CONTEXT
    // ===============================
    const { organizationId, session, role } = await requireOrgAccess([
      "OWNER",
      "ADMIN",
      "PM",
      "MEMBER",
      "CLIENT",
    ]);

    const { ip, userAgent } = getRequestMeta(req);
    const body = await req.json();

    if (!body.content || body.content.trim().length < 2) {
      return NextResponse.json({ error: "Comment too short" }, { status: 400 });
    }

    const isClient = role === "CLIENT";

    // ===============================
    // OWNERSHIP CHECK
    // ===============================
    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      select: {
        id: true,
        title: true,
        assigneeId: true,
        projectId: true,
        project: {
          select: {
            clientId: true,
            organizationId: true,
          },
        },
      },
    });

    if (!task || task.project.organizationId !== organizationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ===============================
    // CREATE COMMENT
    // ===============================
    const comment = await prisma.taskComment.create({
      data: {
        taskId: task.id,
        userId: session.userId,
        content: body.content.trim(),
        // isClient: isClient, // aktifkan jika kolom tersedia
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    // ===============================
    // 🔔 NOTIFICATION: ASSIGNEE
    // - dari siapa pun selain assignee
    // ===============================
    if (task.assigneeId && task.assigneeId !== session.userId) {
      await createNotification({
        organizationId,
        userId: task.assigneeId,
        title: "Komentar baru di task",
        body: task.title,
        href: `/tasks/${task.id}`,
      });
    }

    // ===============================
    // 🔔 NOTIFICATION: CLIENT
    // - hanya jika komentar dari TIM
    // ===============================
    if (!isClient && task.project.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: task.project.clientId },
        select: { email: true },
      });

      if (client?.email) {
        const clientUser = await prisma.user.findUnique({
          where: { email: client.email },
          select: { id: true },
        });

        if (clientUser) {
          await createNotification({
            organizationId,
            userId: clientUser.id,
            title: "Komentar baru dari tim",
            body: `Task "${task.title}" mendapat komentar baru`,
            href: `/client/projects/${task.projectId}`,
          });
        }
      }
    }

    // ===============================
    // AUDIT LOG
    // ===============================
    await logAudit({
      organizationId,
      actorUserId: session.userId,
      actorRole: role,
      action: "TASK_COMMENT_CREATE",
      entityType: "TaskComment",
      entityId: comment.id,
      summary: `Komentar ditambahkan pada task "${task.title}"`,
      meta: {
        taskId: task.id,
        isClient,
      },
      ip,
      userAgent,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error("[TASK_COMMENT_POST]", err);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
