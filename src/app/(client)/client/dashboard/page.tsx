import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function percent(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export default async function ClientDashboardPage() {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

  // 1️⃣ Pastikan user adalah CLIENT
  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: orgId,
      role: "CLIENT",
      isActive: true,
    },
  });

  if (!membership) {
    throw new Error("Forbidden");
  }

  // 2️⃣ Ambil semua project yang punya client
  // (client melihat semua project yang memang untuk client)
  const projects = await prisma.project.findMany({
    where: {
      organizationId: orgId,
      clientId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      tasks: {
        select: { status: true },
      },
    },
  });

  const view = projects.map((p) => {
    const total = p.tasks.length;
    const done = p.tasks.filter((t) => t.status === "DONE").length;
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      progress: percent(done, total),
      total,
      done,
    };
  });

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Client Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Pantau progres project kamu secara real-time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {view.length === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Belum ada project yang tersedia.
            </CardContent>
          </Card>
        )}

        {view.map((p) => (
          <Link key={p.id} href={`/client/projects/${p.id}`}>
            <Card className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 hover:bg-muted/40 transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Status: {String(p.status).replaceAll("_", " ")}
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{p.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.done}/{p.total} task selesai
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
