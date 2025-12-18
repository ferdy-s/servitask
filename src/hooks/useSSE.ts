"use client";

import { useEffect } from "react";

export function useSSE(onMessage: (data: any) => void) {
  useEffect(() => {
    const es = new EventSource("/api/sse");

    es.addEventListener("notification", (e: MessageEvent) => {
      try {
        onMessage(JSON.parse(e.data));
      } catch {}
    });

    return () => es.close();
  }, [onMessage]);
}
