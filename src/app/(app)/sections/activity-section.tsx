"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityItem } from "../dashboard/page";

export default function ActivitySection({
  items = [],
}: {
  items?: ActivityItem[];
}) {
  return (
    <Card className="rounded-2xl border bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Jejak aktivitas terbaru dari task, komentar, dan time tracking.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Belum ada aktivitas.
          </div>
        )}

        {items.map((a) => (
          <Link
            key={a.id}
            href={a.href || "#"}
            className="block rounded-xl border bg-background/60 px-4 py-3 transition hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">{a.title}</div>
                {a.meta && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {a.meta}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(a.at).toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
