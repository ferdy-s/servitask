"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ModuleItem = {
  id: string;
  key: string;
  name: string;
  isEnabled: boolean;
};

export default function ModuleSettingsPage() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((data: ModuleItem[]) => {
        setModules(data);
        setLoading(false);
      });
  }, []);

  async function toggle(moduleId: string, enabled: boolean) {
    // optimistic update
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, isEnabled: enabled } : m))
    );

    await fetch("/api/modules/toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, enabled }),
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Module Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Aktifkan atau nonaktifkan fitur dashboard untuk organisasi ini.
        </p>
      </div>

      <div className="space-y-4">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}

        {!loading &&
          modules.map((m) => (
            <Card
              key={m.id}
              className="rounded-2xl border hover:bg-muted/30 transition"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">{m.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    key: {m.key}
                  </div>
                </div>

                <Switch
                  checked={m.isEnabled}
                  onCheckedChange={(value: boolean) => toggle(m.id, value)}
                />
              </CardHeader>
            </Card>
          ))}
      </div>
    </div>
  );
}
