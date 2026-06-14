"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="text-[0.8rem] font-bold uppercase tracking-wider2 text-white/70 hover:text-white"
    >
      Log out
    </button>
  );
}
