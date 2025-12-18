"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Props definition dipindah ke sini
export default function OrgSelector({
  organizations,
}: {
  organizations: {
    id: string;
    name: string;
    role: string;
  }[];
}) {
  const router = useRouter();

  async function selectOrg(id: string) {
    await fetch("/api/organizations/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: id }),
    });

    router.push("/dashboard");
    router.refresh(); // Refresh agar layout dashboard update
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Pilih Organisasi</h1>
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="rounded-2xl card-hover cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => selectOrg(org.id)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{org.name}</div>
                <div className="text-sm text-muted-foreground">
                  Role: {org.role}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Masuk
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
