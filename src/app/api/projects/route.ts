import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgAccess } from "@/lib/require-org-access";

export async function POST(req: Request) {
  try {
    const { organizationId } = await requireOrgAccess(["OWNER", "ADMIN", "PM"]);

    const body = await req.json();

    const project = await prisma.project.create({
      data: {
        name: body.name,
        organizationId,
        clientId: body.clientId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
