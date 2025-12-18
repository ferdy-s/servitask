import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* =========================
   CSP BUILDER (NONCE-BASED)
========================= */
function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/* =========================
   EDGE-SAFE NONCE GENERATOR
========================= */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* =========================
     1. HARD BYPASS
  ========================= */
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  /* =========================
     2. API NON-AUTH
  ========================= */
  if (pathname.startsWith("/api")) {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  /* =========================
     3. PUBLIC ROUTES
  ========================= */
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/invite",
  ];

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  /* =========================
     4. AUTH GUARD
  ========================= */
  const session = req.cookies.get("st_session");

  if (!session && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /* =========================
     5. SECURITY HEADERS + CSP
  ========================= */
  const res = NextResponse.next();

  const nonce = generateNonce();

  // expose nonce to server components
  res.headers.set("x-nonce", nonce);

  applySecurityHeaders(res, nonce);

  return res;
}

/* =========================
   SECURITY HEADERS HELPER
========================= */
function applySecurityHeaders(res: NextResponse, nonce?: string) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  if (nonce) {
    res.headers.set("Content-Security-Policy", buildCsp(nonce));
  }
}

/* =========================
   6. MATCHER
========================= */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
