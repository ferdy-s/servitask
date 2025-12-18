import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || password.length < 8) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
  });

  if (!invite || invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired invite" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    // ambil nama client
    const client = await tx.client.findFirst({
      where: {
        organizationId: invite.organizationId,
        email: invite.email,
      },
      select: { name: true },
    });

    const createdUser = await tx.user.create({
      data: {
        name: client?.name ?? invite.email.split("@")[0],
        email: invite.email,
        password: hashed,
        isActive: true,
      },
    });

    await tx.organizationUser.create({
      data: {
        organizationId: invite.organizationId,
        userId: createdUser.id,
        role: invite.role, // CLIENT
      },
    });

    await tx.inviteToken.delete({
      where: { id: invite.id },
    });

    return createdUser;
  });

  await createSession(user.id, invite.organizationId);

  return NextResponse.json({ ok: true });
}
