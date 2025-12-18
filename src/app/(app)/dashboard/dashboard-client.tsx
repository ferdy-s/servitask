"use client";

import { motion } from "framer-motion";
import { DashboardData } from "./page";
import type { OrgRole } from "@/components/app-shell/app-shell";
import { hasRole, hasModule } from "@/lib/feature-guard";

import KPISection from "../sections/kpi-section";
import StatsCards from "./stats-cards";
import ActivitySection from "../sections/activity-section";
import InsightSection from "../sections/insight-section";
import QuickActionSection from "../sections/quick-action-section";

export default function DashboardClient({
  data,
  role,
  modules,
}: {
  data: DashboardData;
  role: OrgRole;
  modules: string[];
}) {
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Ringkasan performa dan aktivitas sesuai peran kamu.
        </p>
      </motion.div>

      {/* KPI (Owner, Admin, PM) */}
      {hasModule(modules, "kpi") && hasRole(role, ["OWNER", "ADMIN", "PM"]) && (
        <KPISection items={data.kpis} />
      )}

      {/* STATS (Owner & Admin) */}
      {hasModule(modules, "stats") && hasRole(role, ["OWNER", "ADMIN"]) && (
        <StatsCards data={data} />
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="xl:col-span-2 space-y-6">
          {/* ACTIVITY (ALL ROLES) */}
          {hasModule(modules, "activity") && (
            <ActivitySection items={data.activity} />
          )}

          {/* ANALYTICS (Owner, Admin, PM) */}
          {hasModule(modules, "analytics") &&
            hasRole(role, ["OWNER", "ADMIN", "PM"]) && (
              <InsightSection
                trend={data.trend14d}
                breakdown={data.statusBreakdown}
              />
            )}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* QUICK ACTIONS (Internal team only) */}
          {hasModule(modules, "quick_actions") &&
            hasRole(role, ["OWNER", "ADMIN", "PM", "MEMBER"]) && (
              <QuickActionSection />
            )}
        </div>
      </div>
    </div>
  );
}
