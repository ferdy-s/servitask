import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

const SESSION_COOKIE = "st_session";

/**
 * Create session + set HttpOnly cookie
 */
export async function createSession(
  userId: string,
  activeOrgId?: string | null
) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 hari

  const session = await prisma.session.create({
    data: {
      userId,
      activeOrgId: activeOrgId ?? null,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return session;
}

/**
 * Destroy session + remove cookie
 */
export async function destroySession() {
  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE)?.value;

  if (!id) return;

  await prisma.session.delete({ where: { id } }).catch(() => null);

  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Get current session + user
 */
export async function getSession() {
  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE)?.value;

  if (!id) return null;

  const session = await prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!session) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id } }).catch(() => null);

    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return session;
}

/**
 * Require session (throw if not logged in)
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Generate secure random token
 */
export function makeToken() {
  return nanoid(32);
}
