export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { rateLimitRedis } from "@/lib/rate-limit-redis";
import { getIp } from "@/lib/ip";
import { logAudit } from "@/lib/audit";
import crypto from "crypto";
import { z } from "zod";

/* =====================
 * Validation Schema
 * ===================== */
const inviteSchema = z.object({
  name: z.string().min(2, "Nama client terlalu pendek"),
  email: z.string().email("Email tidak valid"),
});

/* =====================
 * POST /api/client/invite
 * ===================== */
export async function POST(req: Request) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;
  const ip = getIp(req);

  /* =====================
   * Rate Limit
   * 20 invite / jam / org
   * ===================== */
  const rl = await rateLimitRedis(`invite:${orgId}`, 20, 3600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Batas undangan tercapai. Coba lagi nanti." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  /* =====================
   * Validate Payload
   * ===================== */
  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  /* =====================
   * RBAC: OWNER / ADMIN
   * ===================== */
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

  /* =====================
   * Upsert Client (Idempotent)
   * ===================== */
  await prisma.client.upsert({
    where: {
      organizationId_email: {
        organizationId: orgId,
        email: normalizedEmail,
      },
    },
    update: { name },
    create: {
      organizationId: orgId,
      name,
      email: normalizedEmail,
    },
  });

  /* =====================
   * Revoke old invites
   * ===================== */
  await prisma.inviteToken.deleteMany({
    where: {
      organizationId: orgId,
      email: normalizedEmail,
      role: "CLIENT",
    },
  });

  /* =====================
   * Create Invite Token
   * ===================== */
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 jam

  await prisma.inviteToken.create({
    data: {
      organizationId: orgId,
      email: normalizedEmail,
      role: "CLIENT",
      token,
      expiresAt,
    },
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

  /* =====================
   * Audit Log
   * ===================== */
  await logAudit({
    organizationId: orgId,
    actorUserId: session.userId,
    actorRole: membership.role,
    action: "CLIENT_INVITE_CREATE",
    entityType: "Client",
    summary: `Invited client: ${normalizedEmail}`,
    meta: { email: normalizedEmail, name },
    ip,
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true, inviteUrl });
}
