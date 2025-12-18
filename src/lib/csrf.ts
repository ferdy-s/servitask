import { cookies, headers } from "next/headers";

export async function requireCsrf() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieToken = cookieStore.get("csrf_token")?.value;
  const headerToken = headerStore.get("x-csrf-token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new Error("CSRF");
  }
}
