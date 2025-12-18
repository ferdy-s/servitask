"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickActionSection() {
  const router = useRouter();

  return (
    <Card className="rounded-2xl border bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Akses cepat untuk kerja harian tim.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button
          className="rounded-xl"
          onClick={() => router.push("/projects/new")}
        >
          Create Project
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push("/projects")}
        >
          Open Projects
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push("/clients/new")}
        >
          Add Client
        </Button>
      </CardContent>
    </Card>
  );
}
