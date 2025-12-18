"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardData } from "./page";
import { StatusBreakdown } from "./page";

export default function StatsCards({ data }: { data: DashboardData }) {
  // Ambil KPI tertentu dari array KPI
  const activeProjects =
    data.kpis.find((k) => k.label === "Total Projects")?.value ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* PROJECT AKTIF */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden rounded-2xl border card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Project Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-semibold tracking-tight">
            {activeProjects}
          </CardContent>
        </Card>
      </motion.div>

      {/* TASK PER STATUS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="rounded-2xl card-hover">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Task per Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.statusBreakdown.map((item: StatusBreakdown) => (
              <div
                key={item.status}
                className="flex items-center justify-between text-sm"
              >
                <span className="uppercase tracking-wide text-muted-foreground">
                  {item.status.replace("_", " ")}
                </span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* INSIGHT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-2xl card-hover">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Data ini akan berkembang menjadi laporan performa berdasarkan role
            (Owner, Admin, PM, Member, Client).
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
