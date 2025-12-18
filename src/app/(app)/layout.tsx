import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import AppShell from "@/components/app-shell/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  // 🔒 HARUS ADA ORG AKTIF
  if (!session.activeOrgId) {
    redirect("/select-organization");
  }

  const activeOrgId = session.activeOrgId; // ⬅️ sekarang string (bukan null)

  // 🔎 Ambil membership + relasi
  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: activeOrgId,
      isActive: true,
    },
    include: {
      user: true,
      organization: true,
    },
  });

  // 🔒 SAFETY GUARD (TypeScript friendly)
  if (!membership) {
    redirect("/select-organization");
  }

  // 🏢 Semua organisasi milik user
  const orgs = await prisma.organizationUser.findMany({
    where: {
      userId: session.userId,
      isActive: true,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 🧩 Module toggle org aktif (WAJIB include module)
  const enabledModules = await prisma.organizationModule.findMany({
    where: {
      organizationId: activeOrgId,
      isEnabled: true,
    },
    include: {
      module: true,
    },
  });

  const moduleKeys = enabledModules.map((m) => m.module.key);

  return (
    <AppShell
      user={{
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
        avatarUrl: membership.user.avatarUrl ?? null,
      }}
      role={membership.role}
      activeOrg={{
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
      }}
      organizations={orgs.map((o) => ({
        id: o.organization.id,
        name: o.organization.name,
        role: o.role,
      }))}
      modules={moduleKeys}
    >
      {children}
    </AppShell>
  );
}
