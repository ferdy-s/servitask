"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendPoint, StatusBreakdown } from "../dashboard/page";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function InsightSection({
  trend,
  breakdown,
}: {
  trend: TrendPoint[];
  breakdown: StatusBreakdown[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-2xl border bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Task Trend (14 hari)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Perbandingan task dibuat vs task selesai.
          </p>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="created"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="done"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Status Breakdown
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribusi status task dalam organisasi.
          </p>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
