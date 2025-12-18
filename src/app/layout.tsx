import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { headers } from "next/headers";
import Script from "next/script";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ WAJIB await (Next.js terbaru)
  const h = await headers();
  const nonce = h.get("x-nonce") ?? undefined;

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>

        {/* CSP-safe global bootstrap (opsional) */}
        <Script
          id="servitask-bootstrap"
          nonce={nonce}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.__SERVITASK__ = {
                theme: "dark",
                locale: "id",
              };
            `,
          }}
        />
      </body>
    </html>
  );
}
