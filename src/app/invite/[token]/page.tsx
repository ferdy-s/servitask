import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import InviteAcceptForm from "./invite-accept-form";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
  });

  if (!invite || invite.expiresAt < new Date()) {
    notFound();
  }

  return <InviteAcceptForm email={invite.email} token={invite.token} />;
}
