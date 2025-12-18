import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { z } from "zod";
// import { logAudit } from "@/lib/audit"; // opsional, jika audit aktif

/* =========================
   Schema
========================= */
const switchSchema = z.object({
  organizationId: z.string().min(1),
});

/* =========================
   POST /api/organizations/switch
========================= */
export async function POST(req: Request) {
  try {
    // Pastikan user login
    const session = await requireSession();

    // CSRF protection
    requireCsrf();

    const body = await req.json();
    const parsed = switchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { organizationId } = parsed.data;

    // Pastikan user memang anggota organisasi tsb
    const membership = await prisma.organizationUser.findFirst({
      where: {
        userId: session.userId,
        organizationId,
        isActive: true,
      },
      select: { role: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No access to organization" },
        { status: 403 }
      );
    }

    // Update active organization di session
    await prisma.session.update({
      where: {
        id: session.id,
        userId: session.userId, // safety extra
      },
      data: {
        activeOrgId: organizationId,
      },
    });

    /* ---------- Audit Log (Opsional) ----------
    await logAudit({
      organizationId,
      actorUserId: session.userId,
      actorRole: membership.role,
      action: "ORG_SWITCH",
      entityType: "Organization",
      entityId: organizationId,
      summary: "Switched active organization",
    });
    ----------------------------------------- */

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (String(error).includes("CSRF")) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    console.error("[ORG_SWITCH_ERROR]", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
