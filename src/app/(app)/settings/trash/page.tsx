"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TrashProject = {
  id: string;
  name: string;
  deletedAt: string;
};

export default function TrashPage() {
  const [items, setItems] = useState<TrashProject[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/trash/projects");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function restore(id: string) {
    setLoadingId(id);
    const res = await fetch(`/api/projects/${id}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) await load();
    setLoadingId(null);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trash</h1>
        <p className="text-sm text-muted-foreground">
          Restore data yang terhapus tanpa kehilangan histori.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Deleted Projects</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Trash masih kosong.
            </div>
          )}

          {items.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border bg-background/70 px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  Deleted: {new Date(p.deletedAt).toLocaleString()}
                </div>
              </div>

              <Button
                className="rounded-xl"
                variant="outline"
                onClick={() => restore(p.id)}
                disabled={loadingId === p.id}
              >
                Restore
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
