import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getOrderPattern } from "@/lib/settings";
import OrderNumberSettings from "@/components/admin/OrderNumberSettings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (!isAdmin()) redirect("/admin/login");

  const pattern = await getOrderPattern();
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const count = await prisma.partRequest.count({ where: { createdAt: { gte: startOfYear } } });

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-8">
      <Link
        href="/admin"
        className="text-[0.72rem] font-bold uppercase tracking-wider2 text-white/50 hover:text-white"
      >
        ← Back to board
      </Link>
      <div className="mt-6">
        <OrderNumberSettings initialPattern={pattern} previewSeq={count + 1} />
      </div>
    </main>
  );
}
