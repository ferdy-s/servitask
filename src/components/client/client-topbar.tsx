"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ClientTopbar({
  clientName,
  userName,
}: {
  clientName: string;
  userName: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-6">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{clientName}</div>
          <div className="text-xs text-muted-foreground truncate">
            Client Portal
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">{userName}</div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
