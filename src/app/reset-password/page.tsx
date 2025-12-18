"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) router.push("/login");
    setLoading(false);
  }

  if (!token) {
    return <p className="p-8 text-center">Invalid token</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Password baru (min 8 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={submit}
            disabled={loading || password.length < 8}
          >
            Simpan Password Baru
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
