"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrgSwitcher({
  orgName,
  orgId,
}: {
  orgName: string;
  orgId: string;
}) {
  const router = useRouter();

  async function switchOrg() {
    await fetch("/api/organizations/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId }),
    });

    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-between rounded-xl"
      onClick={switchOrg}
    >
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        <span className="truncate">{orgName}</span>
      </div>
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}
