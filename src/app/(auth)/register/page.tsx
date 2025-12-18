"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    orgName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mendaftar");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-xl border border-border/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              Buat Akun Baru
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Bangun sistem kerja profesional untuk bisnis jasa kamu
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Nama Lengkap"
                value={form.name}
                onChange={handleChange}
                required
              />

              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <Input
                name="password"
                type="password"
                placeholder="Password (min. 8 karakter)"
                value={form.password}
                onChange={handleChange}
                required
              />

              <Input
                name="orgName"
                placeholder="Nama Organisasi / Agency"
                value={form.orgName}
                onChange={handleChange}
                required
              />

              {error && <div className="text-sm text-red-500">{error}</div>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl font-medium transition-all"
              >
                {loading ? "Membuat akun..." : "Daftar & Buat Organisasi"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Dengan mendaftar, kamu otomatis menjadi <strong>Owner</strong>{" "}
                organisasi
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
