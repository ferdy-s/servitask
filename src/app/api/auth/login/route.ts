import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { rateLimitRedis } from "@/lib/rate-limit-redis";
import { logAudit } from "@/lib/audit";

/* =========================
   Constants
========================= */
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/* =========================
   Schema
========================= */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/* =========================
   Utils
========================= */
function getIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/* =========================
   POST /api/auth/login
========================= */
export async function POST(req: Request) {
  try {
    const ip = getIp(req);

    /* ---------- Rate Limit ----------
       10 attempt / 5 menit / IP
    -------------------------------- */
    const rl = await rateLimitRedis(`login:${ip}`, 10, 300);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSec),
          },
        }
      );
    }

    /* ---------- Parse & Validate ----------
       Jangan bocorkan detail error
    ------------------------------------- */
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    let { email, password } = parsed.data;
    email = email.toLowerCase();

    /* ---------- Fetch User ----------
       Sertakan orgUsers aktif
    -------------------------------- */
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orgUsers: {
          where: { isActive: true },
          select: { organizationId: true },
        },
      },
    });

    /* ---------- User Validation ----------
       Jangan bocorkan apakah email ada
    ----------------------------------- */
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    /* ---------- Account Lockout ----------
       Akun terkunci sementara
    ------------------------------------ */
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        {
          error:
            "Akun terkunci sementara karena terlalu banyak percobaan login. Silakan coba lagi nanti.",
        },
        { status: 423 } // Locked
      );
    }

    /* ---------- Password Verify ---------- */
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      const failedCount = (user.failedLoginCount ?? 0) + 1;

      if (failedCount >= MAX_ATTEMPTS) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: 0,
            lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000),
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: failedCount },
        });
      }

      await logAudit({
        organizationId: user.orgUsers[0]?.organizationId ?? "unknown",
        actorUserId: user.id,
        actorRole: null,
        action: "LOGIN_FAILED",
        entityType: "Auth",
        summary: `Login failed from IP ${ip}`,
        meta: { ip },
      });

      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    /* ---------- Login Success ----------
       Reset lock & failed count
    ---------------------------------- */
    if (user.failedLoginCount > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: 0,
          lockedUntil: null,
        },
      });
    }

    /* ---------- Active Organization ----------
       Auto-set jika hanya 1 org
    ----------------------------------------- */
    let activeOrgId: string | null = null;

    if (user.orgUsers.length === 1) {
      activeOrgId = user.orgUsers[0].organizationId;
    }

    /* ---------- Session Rotation ----------
       Cookie HttpOnly + Secure
    -------------------------------------- */
    await createSession(user.id, activeOrgId);

    await logAudit({
      organizationId: activeOrgId ?? "unknown",
      actorUserId: user.id,
      actorRole: null,
      action: "LOGIN_SUCCESS",
      entityType: "Auth",
      summary: `User logged in from IP ${ip}`,
      meta: { ip },
    });

    return NextResponse.json({
      ok: true,
      redirect: activeOrgId ? "/dashboard" : "/select-organization",
    });
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
