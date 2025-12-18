let csrfToken: string | null = null;

async function ensureCsrfToken(): Promise<string> {
  if (csrfToken !== null) {
    return csrfToken;
  }

  const res = await fetch("/api/csrf", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to get CSRF token");
  }

  const data: { token?: string } = await res.json();

  if (!data.token) {
    throw new Error("CSRF token missing in response");
  }

  csrfToken = data.token; // sekarang pasti string
  return data.token; // ✅ return string, bukan csrfToken
}
