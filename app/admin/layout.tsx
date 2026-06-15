import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdmin();
  return (
    <div className="min-h-[100dvh] bg-royal text-white">
      {authed && (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-royal/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5">
            <Link href="/admin" className="flex items-baseline gap-2">
              <span className="font-display text-xl tracking-tightest">SPAREZY</span>
              <span className="text-[0.7rem] font-bold uppercase tracking-wider2 text-white/50">Admin</span>
            </Link>
            <div className="flex items-center gap-5">
              <Link
                href="/admin/settings"
                className="text-[0.72rem] font-bold uppercase tracking-wider2 text-white/50 hover:text-white"
              >
                Settings
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
