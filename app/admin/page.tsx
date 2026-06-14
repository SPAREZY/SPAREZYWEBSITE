import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import AdminBoard from "@/components/admin/AdminBoard";
import type { Lead } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdmin()) redirect("/admin/login");

  const rows = await prisma.partRequest.findMany({
    include: { quote: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const initial = JSON.parse(JSON.stringify(rows)) as Lead[];

  return <AdminBoard initialRequests={initial} />;
}
