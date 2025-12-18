import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const session = await requireSession();

  const notif = await prisma.notification.findFirst({
    where: {
      id,
      userId: session.userId,
    },
  });

  if (!notif) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
