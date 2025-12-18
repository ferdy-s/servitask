import { prisma } from "@/lib/db";

type CreateNotificationInput = {
  organizationId: string;
  userId: string;
  title: string;
  body?: string;
  href?: string;
};

export function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: input,
  });
}
