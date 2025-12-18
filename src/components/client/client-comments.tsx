"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Comment = {
  id: string;
  content: string;
  isClient: boolean;
  createdAt: string;
  user: { name: string };
};

export default function ClientComments({ taskId }: { taskId: string }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/client/tasks/${taskId}/comments`)
      .then((r) => r.json())
      .then(setItems);
  }, [taskId]);

  async function submit() {
    if (content.trim().length < 2) return;
    setLoading(true);

    const res = await fetch(`/api/client/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const c = await res.json();
      setItems((p) => [...p, c]);
      setContent("");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Comments</div>

      <div className="space-y-2">
        {items.map((c) => (
          <div
            key={c.id}
            className={`rounded-xl border px-3 py-2 text-sm ${
              c.isClient ? "bg-muted/50" : "bg-background"
            }`}
          >
            <div className="text-xs text-muted-foreground">
              {c.user.name} • {new Date(c.createdAt).toLocaleString()}
            </div>
            <div>{c.content}</div>
          </div>
        ))}
      </div>

      <Textarea
        placeholder="Tulis komentar atau feedback…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Button onClick={submit} disabled={loading}>
        Kirim Komentar
      </Button>
    </div>
  );
}
