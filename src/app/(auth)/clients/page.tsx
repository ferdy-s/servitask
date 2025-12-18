import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import type { Client } from "@prisma/client";

export default async function ClientsPage() {
  const session = await requireSession();

  const clients: Client[] = session.activeOrgId
    ? await prisma.client.findMany({
        where: { organizationId: session.activeOrgId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Daftar client yang terhubung dengan organisasi kamu
          </p>
        </div>

        <Link href="/clients/new">
          <Button className="rounded-xl">Tambah Client</Button>
        </Link>
      </div>

      {/* Empty State */}
      {clients.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="py-20 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Belum ada client yang terdaftar.
            </p>
            <Link href="/clients/new">
              <Button variant="secondary" className="rounded-xl">
                Tambah Client Pertama
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      {clients.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="rounded-2xl">
              <CardContent className="py-4 space-y-1 text-sm">
                <div className="font-medium">{client.name}</div>
                <div className="text-muted-foreground">
                  {client.company || "—"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
