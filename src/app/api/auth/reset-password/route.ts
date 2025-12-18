import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || password.length < 8) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const reset = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!reset || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.delete({
      where: { id: reset.id },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
