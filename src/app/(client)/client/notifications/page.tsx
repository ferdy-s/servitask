"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSSE } from "@/hooks/useSSE";

type Notif = {
  id: string;
  title: string;
  body?: string;
  href?: string;
  createdAt: string;
};

export default function ClientNotifications() {
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    fetch("/api/client/notifications")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  useSSE((n) => {
    setItems((prev) => [n, ...prev]);
  });

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">Notifications</h1>

      {items.map((n) => (
        <Link
          key={n.id}
          href={n.href ?? "#"}
          className="block rounded-xl border p-4 bg-background/70 hover:bg-muted/30 transition"
        >
          <div className="text-sm font-medium">{n.title}</div>
          {n.body && (
            <div className="text-sm text-muted-foreground">{n.body}</div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </Link>
      ))}
    </div>
  );
}
