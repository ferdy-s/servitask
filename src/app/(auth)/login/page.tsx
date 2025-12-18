"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    captcha: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  useEffect(() => {
    regenerateCaptcha();
  }, []);

  function regenerateCaptcha() {
    setA(Math.floor(Math.random() * 9) + 1);
    setB(Math.floor(Math.random() * 9) + 1);
    setForm((f) => ({ ...f, captcha: "" }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (Number(form.captcha) !== a + b) {
      setError("Captcha salah");
      regenerateCaptcha();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin", // ⬅️ WAJIB
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      router.push(data.redirect || "/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      // 🔑 INI YANG PENTING → pastikan loading selalu berhenti
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-black text-white">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-black via-neutral-900 to-black">
        <span className="text-xs tracking-widest text-neutral-400 mb-6">
          SERVITASK PLATFORM
        </span>

        <h1 className="text-4xl font-semibold leading-tight mb-6">
          Kelola project, tim, dan klien <br />
          dalam satu ekosistem kerja modern
        </h1>

        <p className="text-neutral-400 text-lg max-w-xl mb-8">
          ServiTask adalah platform manajemen kerja berbasis organisasi yang
          dirancang untuk tim modern, mengintegrasikan task, workflow, dan
          kolaborasi lintas klien secara aman dan scalable.
        </p>

        <ul className="text-sm text-neutral-400 space-y-3">
          <li>• Multi-organisasi & role-based access</li>
          <li>• Workflow task & project terstruktur</li>
          <li>• Kolaborasi real-time antar tim</li>
          <li>• Siap untuk skala enterprise</li>
        </ul>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="flex items-center justify-center px-6 bg-neutral-950">
        <div className="relative w-full max-w-md">
          {/* Ambient glow layer */}
          <div className="absolute -inset-2 rounded-[36px] bg-gradient-to-br from-white/10 via-white/5 to-transparent blur-3xl opacity-70" />

          {/* Floating glass panel */}
          <div
            className="
        relative
        rounded-[30px]
        bg-neutral-900/80
        backdrop-blur-2xl
        px-10 py-12
        shadow-[0_40px_140px_rgba(0,0,0,0.9)]
      "
          >
            {/* Header */}
            <h2 className="text-2xl font-semibold mb-2 text-white">Sign In</h2>
            <div className="w-12 h-[2px] bg-gradient-to-r from-white/80 to-white/20 rounded mb-10" />

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Email */}
              <div>
                <label className="text-sm text-neutral-400">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="example@gmail.com"
                  className="
              mt-2 w-full
              rounded-xl
              bg-neutral-800/70
              border border-white/10
              px-4 py-3
              text-white
              placeholder-neutral-500
              focus:outline-none
              focus:border-white/40
              transition
            "
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-sm text-neutral-400">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="
              mt-2 w-full
              rounded-xl
              bg-neutral-800/70
              border border-white/10
              px-4 py-3 pr-12
              text-white
              placeholder-neutral-500
              focus:outline-none
              focus:border-white/40
              transition
            "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
              absolute right-4 top-[42px]
              text-neutral-400
              hover:text-white
              transition
            "
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Captcha */}
              <div>
                <label className="text-sm text-neutral-400">
                  Berapa hasil dari {a} + {b}?
                </label>
                <input
                  type="text"
                  name="captcha"
                  value={form.captcha}
                  onChange={handleChange}
                  required
                  placeholder="Jawaban"
                  className="
              mt-2 w-full
              rounded-xl
              bg-neutral-800/70
              border border-white/10
              px-4 py-3
              text-white
              placeholder-neutral-500
              focus:outline-none
              focus:border-white/40
              transition
            "
                />
              </div>

              {/* Error */}
              {error && <div className="text-sm text-red-400">{error}</div>}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="
            w-full rounded-xl py-3
            bg-white text-black
            font-semibold
            hover:bg-neutral-200
            active:scale-[0.98]
            transition
          "
              >
                {loading ? "Verifying..." : "Login"}
              </button>
              {/* Forgot password */}
              <div className="flex justify-center">
                <a
                  href="/forgot-password"
                  className="text-xs text-neutral-400 hover:text-white transition"
                >
                  Lupa password?
                </a>
              </div>
              {/* Register */}
              <p className="text-sm text-center text-neutral-400">
                Belum punya akun?{" "}
                <a
                  href="/register"
                  className="underline hover:text-white transition"
                >
                  Daftar
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
