"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  actorRole: string | null;
  createdAt: string;
};

export default function AuditPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AuditRow[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/audit?q=${encodeURIComponent(q)}&take=80`)
        .then((r) => r.json())
        .then(setRows);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Riwayat aksi penting untuk keamanan, compliance, dan troubleshooting.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari action / entity / summary…"
          />

          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-3">Action</div>
              <div className="col-span-2">Entity</div>
              <div className="col-span-3">Summary</div>
            </div>

            {rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-t bg-background/70 hover:bg-muted/20 transition"
              >
                <div className="col-span-2 text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
                <div className="col-span-2 text-xs">{r.actorRole ?? "-"}</div>
                <div className="col-span-3 font-medium truncate">
                  {r.action}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground truncate">
                  {r.entityType}
                  {r.entityId ? `:${r.entityId}` : ""}
                </div>
                <div className="col-span-3 text-sm text-muted-foreground truncate">
                  {r.summary}
                </div>
              </div>
            ))}

            {rows.length === 0 && (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                Tidak ada log.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
