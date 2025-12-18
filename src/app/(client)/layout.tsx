import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import ClientSidebar from "@/components/client/client-sidebar";
import ClientTopbar from "@/components/client/client-topbar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

  // Pastikan user adalah CLIENT
  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: orgId,
      role: "CLIENT",
      isActive: true,
    },
    select: { id: true },
  });

  if (!membership) {
    throw new Error("Forbidden");
  }

  // Ambil data client via email (sesuai implementasi kamu)
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  const client = await prisma.client.findFirst({
    where: {
      organizationId: orgId,
      email: user?.email ?? "",
    },
    select: { name: true },
  });

  return (
    <div className="flex min-h-screen bg-muted/30">
      <ClientSidebar />

      <div className="flex flex-1 flex-col">
        <ClientTopbar
          clientName={client?.name ?? "Client"}
          userName={user?.name ?? "Client"}
        />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
