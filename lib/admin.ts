import { cookies } from "next/headers";

const COOKIE = "sparezy_admin";
export const ADMIN_COOKIE = COOKIE;

// Convenience password for local dev only. In production a missing
// ADMIN_PASSWORD must never fall back to it — that would leave /admin open to
// anyone who has read this repo. Returns null instead, and every caller treats
// null as "deny", so the panel locks rather than opening up.
const DEV_FALLBACK = "sparezy-admin";

export function adminPassword(): string | null {
  const configured = process.env.ADMIN_PASSWORD;
  if (configured) return configured;
  return process.env.NODE_ENV === "production" ? null : DEV_FALLBACK;
}

export function isAdmin(): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  const v = cookies().get(COOKIE)?.value;
  return !!v && v === expected;
}
