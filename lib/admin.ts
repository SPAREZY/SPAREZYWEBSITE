import { cookies } from "next/headers";

const COOKIE = "sparezy_admin";
export const ADMIN_COOKIE = COOKIE;

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "sparezy-admin";
}

export function isAdmin(): boolean {
  const v = cookies().get(COOKIE)?.value;
  return !!v && v === adminPassword();
}
