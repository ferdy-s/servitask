"use client";

import { Card, CardContent } from "@/components/ui/card";
import { KPIItem } from "@/types/kpi";
import { sortKpiByValue, calculateTotal } from "@/lib/kpi";

export default function KPISection({ items = [] }: { items?: KPIItem[] }) {
  const sorted = sortKpiByValue(items);
  const total = calculateTotal(items);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {sorted.map((item) => (
        <Card
          key={item.label}
          className="rounded-2xl border bg-gradient-to-br from-background to-muted/40 card-hover"
        >
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">{item.label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* TOTAL (optional visual accent) */}
      <Card className="rounded-2xl border-dashed hidden xl:block">
        <CardContent className="p-5">
          <div className="text-sm text-muted-foreground">Total KPI Value</div>
          <div className="mt-2 text-3xl font-semibold">{total}</div>
        </CardContent>
      </Card>
    </div>
  );
}
