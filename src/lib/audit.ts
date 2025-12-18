import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AuditInput = {
  organizationId: string;
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  meta?: Prisma.InputJsonValue; // ✅ FIX UTAMA DI SINI
  ip?: string | null;
  userAgent?: string | null;
};

export async function logAudit(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId ?? null,
      actorRole: input.actorRole ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      meta: input.meta,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}
