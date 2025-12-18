"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InviteAcceptForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (password.length < 8) return;
    setLoading(true);

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      router.push("/client/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Set Password</CardTitle>
          <p className="text-sm text-muted-foreground">{email}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="password"
            placeholder="Password (min 8 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={submit} disabled={loading}>
            Aktivasi Akun
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
