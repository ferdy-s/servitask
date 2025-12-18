"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Lupa Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <p className="text-sm text-muted-foreground">
              Jika email terdaftar, kami telah mengirimkan link reset password.
            </p>
          ) : (
            <>
              <Input
                placeholder="Email terdaftar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={submit}
                disabled={loading || !email}
              >
                Kirim Link Reset
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
