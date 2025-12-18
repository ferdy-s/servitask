import { prisma } from "@/lib/db";
import { pushSSE } from "@/app/api/sse/route";

type NotifyInput = {
  organizationId: string;
  userId: string;
  title: string;
  body?: string;
  href?: string;
};

export async function notify(input: NotifyInput) {
  const n = await prisma.notification.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });

  // push realtime
  pushSSE(input.organizationId, input.userId, {
    id: n.id,
    title: n.title,
    body: n.body,
    href: n.href,
    createdAt: n.createdAt,
  });
}
