import { redirect } from "next/navigation";
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
    <main className="mx-auto max-w-[1400px] px-5 py-6">
      <h1 className="font-display text-2xl tracking-tightest sm:text-3xl">Settings</h1>
      <p className="mt-1 text-[0.8rem] text-white/50">Configure how the storefront and ERP behave.</p>
      <div className="mt-6">
        <OrderNumberSettings initialPattern={pattern} previewSeq={count + 1} />
      </div>
    </main>
  );
}
