import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6 py-24 flex flex-col items-center text-center">
        {/* Badge */}
        <span className="mb-6 inline-block rounded-full border border-white/10 px-4 py-1 text-xs tracking-widest text-neutral-400">
          SERVITASK PLATFORM
        </span>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight max-w-4xl">
          Satu Sistem Kerja Digital untuk Mengelola Tim, Project, dan Kolaborasi
        </h1>

        {/* Description */}
        <p className="mt-8 text-lg md:text-xxl text-neutral-400 max-w-4x2 leading-relaxed">
          ServiTask adalah aplikasi berbasis website yang membantu organisasi
          mengelola project, task, tim, dan klien dalam satu sistem
          terintegrasi. Dirancang untuk workflow modern dengan fokus pada
          efisiensi, kolaborasi, dan skalabilitas jangka panjang.
        </p>

        {/* Features */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
          <div className="rounded-2xl bg-neutral-900 p-6 border border-white/10 flex flex-col items-center">
            <h3 className="font-semibold mb-2">Manajemen Project</h3>
            <p className="text-sm text-neutral-400">
              Atur project, task, dan deadline secara terstruktur dan terpantau.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 border border-white/10 flex flex-col items-center">
            <h3 className="font-semibold mb-2">Kolaborasi Tim</h3>
            <p className="text-sm text-neutral-400">
              Mendukung kerja tim lintas divisi dengan akses berbasis peran.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 border border-white/10 flex flex-col items-center">
            <h3 className="font-semibold mb-2">Multi-Organisasi</h3>
            <p className="text-sm text-neutral-400">
              Cocok untuk agensi, startup, dan perusahaan dengan banyak klien.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 border border-white/10 flex flex-col items-center">
            <h3 className="font-semibold mb-2">Skala Enterprise</h3>
            <p className="text-sm text-neutral-400">
              Arsitektur aman, scalable, dan siap dikembangkan jangka panjang.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="
              inline-flex items-center justify-center
              rounded-xl bg-white text-black
              px-8 py-3 font-semibold
              hover:bg-neutral-200
              transition
            "
          >
            Masuk ke Dashboard
          </Link>

          <Link
            href="/register"
            className="
              inline-flex items-center justify-center
              rounded-xl border border-white/20
              px-8 py-3 font-medium
              text-white
              hover:bg-white/5
              transition
            "
          >
            Daftar Akun
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-14 text-sm text-neutral-500 max-w-xl">
          Dirancang untuk tim modern yang mengutamakan kejelasan, kecepatan, dan
          kontrol penuh atas workflow kerja digital.
        </p>
      </div>
    </main>
  );
}
