import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import DashboardClient from "./dashboard-client";
import { KPIItem } from "@/types/kpi";

/* ================= TYPES ================= */

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type TrendPoint = {
  date: string; // YYYY-MM-DD
  created: number;
  done: number;
};

export type StatusBreakdown = {
  status: TaskStatus;
  count: number;
};

export type ActivityItem = {
  id: string;
  type: "TASK_CREATED" | "COMMENT" | "TIME_ENTRY";
  title: string;
  meta?: string;
  href?: string;
  at: string;
};

export type DashboardData = {
  kpis: KPIItem[];
  trend14d: TrendPoint[];
  statusBreakdown: StatusBreakdown[];
  activity: ActivityItem[];
};

/* ================= UTILS ================= */

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ================= PAGE ================= */

export default async function DashboardPage() {
  const session = await requireSession();
  const orgId = session.activeOrgId!;

  /* ---------- MEMBERSHIP & ROLE ---------- */
  const membership = await prisma.organizationUser.findFirst({
    where: {
      userId: session.userId,
      organizationId: orgId,
      isActive: true,
    },
  });

  if (!membership) {
    throw new Error("Unauthorized");
  }

  const role = membership.role;

  /* ---------- MODULE TOGGLE (FIX UTAMA) ---------- */
  const enabledModules = await prisma.organizationModule.findMany({
    where: {
      organizationId: orgId,
      isEnabled: true,
    },
    include: {
      module: true,
    },
  });

  const moduleKeys = enabledModules.map((m) => m.module.key);

  /* ---------- KPI ---------- */
  const [totalProjects, activeTasks, completedTasks, teamMembers] =
    await Promise.all([
      prisma.project.count({ where: { organizationId: orgId } }),
      prisma.task.count({
        where: {
          organizationId: orgId,
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
      }),
      prisma.task.count({
        where: { organizationId: orgId, status: "DONE" },
      }),
      prisma.organizationUser.count({
        where: { organizationId: orgId, isActive: true },
      }),
    ]);

  const kpis: KPIItem[] =
    role === "OWNER" || role === "ADMIN"
      ? [
          { label: "Total Projects", value: totalProjects },
          { label: "Active Tasks", value: activeTasks },
          { label: "Tasks Completed", value: completedTasks },
          { label: "Team Members", value: teamMembers },
        ]
      : [
          { label: "Active Tasks", value: activeTasks },
          { label: "Tasks Completed", value: completedTasks },
        ];

  /* ---------- TREND 14 DAYS ---------- */
  const days = 14;
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const [createdRows, doneRows] = await Promise.all([
    prisma.task.findMany({
      where: { organizationId: orgId, createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    prisma.task.findMany({
      where: {
        organizationId: orgId,
        status: "DONE",
        updatedAt: { gte: start },
      },
      select: { updatedAt: true },
    }),
  ]);

  const createdMap = new Map<string, number>();
  createdRows.forEach((r) => {
    const key = toYmd(r.createdAt);
    createdMap.set(key, (createdMap.get(key) || 0) + 1);
  });

  const doneMap = new Map<string, number>();
  doneRows.forEach((r) => {
    const key = toYmd(r.updatedAt);
    doneMap.set(key, (doneMap.get(key) || 0) + 1);
  });

  const trend14d: TrendPoint[] = Array.from({ length: days }).map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = toYmd(d);
    return {
      date: key,
      created: createdMap.get(key) || 0,
      done: doneMap.get(key) || 0,
    };
  });

  /* ---------- STATUS BREAKDOWN ---------- */
  const grouped = await prisma.task.groupBy({
    by: ["status"],
    where: { organizationId: orgId },
    _count: { status: true },
  });

  const statusBreakdown: StatusBreakdown[] = (
    ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const
  ).map((s) => ({
    status: s,
    count: grouped.find((g) => g.status === s)?._count.status ?? 0,
  }));

  /* ---------- ACTIVITY ---------- */
  const [taskRecent, commentRecent, timeRecent] = await Promise.all([
    prisma.task.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.taskComment.findMany({
      where: { task: { organizationId: orgId } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, content: true, createdAt: true, taskId: true },
    }),
    prisma.timeEntry.findMany({
      where: { task: { organizationId: orgId } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, minutes: true, createdAt: true, taskId: true },
    }),
  ]);

  const activity: ActivityItem[] = [
    ...taskRecent.map((t) => ({
      id: `task_${t.id}`,
      type: "TASK_CREATED" as const,
      title: "Task dibuat",
      meta: t.title,
      href: `/tasks/${t.id}`,
      at: t.createdAt.toISOString(),
    })),
    ...commentRecent.map((c) => ({
      id: `comment_${c.id}`,
      type: "COMMENT" as const,
      title: "Komentar baru",
      meta: c.content?.slice(0, 80),
      href: `/tasks/${c.taskId}`,
      at: c.createdAt.toISOString(),
    })),
    ...timeRecent.map((te) => ({
      id: `time_${te.id}`,
      type: "TIME_ENTRY" as const,
      title: "Time entry ditambahkan",
      meta: `${te.minutes} menit`,
      href: `/tasks/${te.taskId}`,
      at: te.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 12);

  const data: DashboardData = {
    kpis,
    trend14d,
    statusBreakdown,
    activity,
  };

  return <DashboardClient data={data} role={role} modules={moduleKeys} />;
}
