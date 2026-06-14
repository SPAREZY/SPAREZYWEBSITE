import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword } from "@/lib/admin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = (body as { password?: string }).password;
  if (typeof password !== "string" || password !== adminPassword()) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
