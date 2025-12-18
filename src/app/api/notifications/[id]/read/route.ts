import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: {
      id: params.id,
      userId: session.userId,
    },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
