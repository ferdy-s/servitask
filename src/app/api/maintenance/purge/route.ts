import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cutoffDate } from "@/lib/retention";
import { logAudit } from "@/lib/audit";

// ===============================
// AUTHORIZATION FOR VERCEL CRON
// ===============================
function authorize(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const token = req.headers.get("x-cron-secret"); // ⬅️ konsisten & simpel

  if (!secret) {
    throw new Error("CRON_SECRET not configured");
  }

  if (token !== secret) {
    throw new Error("Unauthorized");
  }
}

// ===============================
// CORE PURGE LOGIC
// ===============================
async function runPurge(req: NextRequest) {
  authorize(req);

  const organizations = await prisma.organization.findMany({
    select: { id: true, retentionDays: true },
  });

  for (const org of organizations) {
    const cutoff = cutoffDate(org.retentionDays);

    // ===== PROJECTS =====
    const projects = await prisma.project.findMany({
      where: {
        organizationId: org.id,
        deletedAt: { lte: cutoff },
      },
      select: { id: true },
    });

    for (const project of projects) {
      await prisma.$transaction(async (tx) => {
        await tx.task.deleteMany({
          where: { projectId: project.id },
        });

        await tx.project.delete({
          where: { id: project.id },
        });
      });

      await logAudit({
        organizationId: org.id,
        action: "PROJECT_HARD_DELETE",
        entityType: "Project",
        entityId: project.id,
        summary: "Auto purge after retention period",
        meta: { retentionDays: org.retentionDays },
      });
    }

    // ===== CLIENTS =====
    const clients = await prisma.client.findMany({
      where: {
        organizationId: org.id,
        deletedAt: { lte: cutoff },
      },
      select: { id: true },
    });

    for (const client of clients) {
      await prisma.client.delete({
        where: { id: client.id },
      });

      await logAudit({
        organizationId: org.id,
        action: "CLIENT_HARD_DELETE",
        entityType: "Client",
        entityId: client.id,
        summary: "Auto purge after retention period",
        meta: { retentionDays: org.retentionDays },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Retention purge completed",
  });
}

// ===============================
// VERCEL CRON → GET
// ===============================
export async function GET(req: NextRequest) {
  try {
    return await runPurge(req);
  } catch (error) {
    console.error("[CRON_PURGE]", error);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

// ===============================
// MANUAL / DEBUG → POST
// ===============================
export async function POST(req: NextRequest) {
  return GET(req);
}
