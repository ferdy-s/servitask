import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgAccess } from "@/lib/require-org-access";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    // ===============================
    // AUTH & CONTEXT
    // ===============================
    const { organizationId, role, session } = await requireOrgAccess([
      "OWNER",
      "ADMIN",
      "PM",
    ]);

    const userId = session.user.id;
    const { ip, userAgent } = getRequestMeta(req);
    const body = await req.json();

    // ===============================
    // UPDATE TASK
    // ===============================
    const task = await prisma.task.update({
      where: {
        id: params.taskId,
        organizationId,
      },
      data: {
        assigneeId: body.assigneeId,
        status: body.status,
      },
      select: {
        id: true,
        title: true,
        status: true,
        assigneeId: true,
        project: {
          select: {
            id: true,
            clientId: true,
            organizationId: true,
          },
        },
      },
    });

    /**
     * ===============================
     * NOTIFICATION: ASSIGNEE (INTERNAL)
     * ===============================
     */
    if (body.assigneeId) {
      await createNotification({
        organizationId,
        userId: body.assigneeId,
        title: "Task baru untuk kamu",
        body: task.title,
        href: `/tasks/${task.id}`,
      });
    }

    /**
     * ===============================
     * NOTIFICATION: CLIENT
     * ===============================
     */
    if (task.project?.clientId && body.status) {
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
            organizationId: task.project.organizationId,
            userId: clientUser.id,
            title: "Update Task",
            body: `Status task "${task.title}" diperbarui menjadi ${String(
              task.status
            ).replaceAll("_", " ")}`,
            href: `/client/projects/${task.project.id}`,
          });
        }
      }
    }

    /**
     * ===============================
     * AUDIT LOG
     * ===============================
     */
    await logAudit({
      organizationId,
      actorUserId: userId,
      actorRole: role,
      action: "TASK_UPDATE",
      entityType: "Task",
      entityId: task.id,
      summary: `Task "${task.title}" diperbarui`,
      meta: {
        assigneeId: body.assigneeId ?? null,
        status: body.status ?? null,
      },
      ip,
      userAgent,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
