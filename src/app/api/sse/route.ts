import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs"; // SSE tidak bisa edge

type SSEClient = {
  userId: string;
  orgId: string;
  controller: ReadableStreamDefaultController;
};

const clients: SSEClient[] = [];

export async function GET() {
  const session = await requireSession();
  const orgId = session.activeOrgId!;
  const userId = session.userId;

  const stream = new ReadableStream({
    start(controller) {
      const client: SSEClient = { userId, orgId, controller };
      clients.push(client);

      controller.enqueue(`event: connected\ndata: ok\n\n`);

      return () => {
        const i = clients.indexOf(client);
        if (i >= 0) clients.splice(i, 1);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// Helper push (dipakai dari mana saja)
export function pushSSE(orgId: string, userId: string, payload: unknown) {
  const msg = `event: notification\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const c of clients) {
    if (c.orgId === orgId && c.userId === userId) {
      c.controller.enqueue(msg);
    }
  }
}
