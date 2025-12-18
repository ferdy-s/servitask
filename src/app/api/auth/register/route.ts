export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { rateLimitRedis } from "@/lib/rate-limit-redis";
import { getIp } from "@/lib/ip";

/**
 * ======================
 * Validation Schema
 * ======================
 */
const registerSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password terlalu panjang"),
  orgName: z.string().min(2, "Nama organisasi terlalu pendek"),
});

/**
 * ======================
 * POST /api/auth/register
 * ======================
 */
export async function POST(req: Request) {
  try {
    /**
     * Rate Limit
     * 5 register / 10 menit / IP
     */
    const ip = getIp(req);
    const rl = await rateLimitRedis(`register:${ip}`, 5, 600);

    if (!rl.ok) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi nanti." },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSec) },
        }
      );
    }

    /**
     * Parse & validate body
     */
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, orgName } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    /**
     * Check existing user
     */
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    /**
     * Hash password
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    /**
     * Slugify organization name
     */
    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    /**
     * Transaction:
     * - Create user
     * - Create organization
     * - Assign OWNER role
     */
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          isActive: true,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug,
        },
      });

      await tx.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
          isActive: true,
        },
      });

      return { user, organization };
    });

    /**
     * Create session (login otomatis)
     */
    await createSession(result.user.id, result.organization.id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
