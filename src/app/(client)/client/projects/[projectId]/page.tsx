import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ClientComments from "@/components/client/client-comments";

function percent(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export default async function ClientProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

  /* ================= ROLE GUARD ================= */
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

  /* ================= CLIENT (BY EMAIL) ================= */
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });

  if (!user?.email) {
    throw new Error("User email not found");
  }

  const client = await prisma.client.findFirst({
    where: {
      organizationId: orgId,
      email: user.email, // ✅ LINK VIA EMAIL
    },
    select: { id: true },
  });

  if (!client) {
    throw new Error("Client not linked to this user");
  }

  /* ================= PROJECT ================= */
  const project = await prisma.project.findFirst({
    where: {
      id: params.projectId,
      organizationId: orgId,
      clientId: client.id,
    },
    select: {
      id: true,
      name: true,
      status: true,
      tasks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  /* ================= PROGRESS ================= */
  const total = project.tasks.length;
  const done = project.tasks.filter((t) => t.status === "DONE").length;
  const prog = percent(done, total);

  /* ================= UI ================= */
  return (
    <div className="max-w-5xl space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Status: {String(project.status).replaceAll("_", " ")}
          </p>
        </div>

        <Link
          href="/client/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Link>
      </div>

      {/* PROGRESS */}
      <Card className="rounded-2xl border bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{prog}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${prog}%` }}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            {done}/{total} task selesai
          </div>
        </CardContent>
      </Card>

      {/* TASK LIST */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-2">
          {project.tasks.length === 0 && (
            <div className="text-sm text-muted-foreground">Belum ada task.</div>
          )}

          {project.tasks.map((t) => (
            <div key={t.id} className="space-y-3">
              <div className="rounded-xl border bg-background/60 px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {String(t.status).replaceAll("_", " ")} •{" "}
                    {String(t.priority ?? "-")}
                  </div>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {t.status === "DONE" ? "Done" : "In progress"}
                </span>
              </div>

              {/* 👇 CLIENT COMMENTS */}
              <ClientComments taskId={t.id} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
