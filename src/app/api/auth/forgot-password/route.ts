import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { rateLimitRedis } from "@/lib/rate-limit-redis";
import { getIp } from "@/lib/ip";

export async function POST(req: Request) {
  const { email } = await req.json();
  const ip = getIp(req);

  // Rate limit: 5 req / 15 menit / IP
  const rl = await rateLimitRedis(`forgot:${ip}`, 5, 900);
  if (!rl.ok) {
    return NextResponse.json({ ok: true }); // sengaja tetap ok
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 menit

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // TODO: kirim email
    console.log("RESET PASSWORD URL:", resetUrl);
  }

  // Selalu return OK (anti enumeration)
  return NextResponse.json({ ok: true });
}
