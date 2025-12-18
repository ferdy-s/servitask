import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const token = crypto.randomBytes(24).toString("hex");

  const res = NextResponse.json({ token });

  // cookie readable oleh client (bukan HttpOnly)
  res.cookies.set("csrf_token", token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}
