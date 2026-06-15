import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import LeadsTable from "@/components/admin/LeadsTable";
import type { Lead } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { focus?: string };
}) {
  if (!isAdmin()) redirect("/admin/login");

  const rows = await prisma.partRequest.findMany({
    include: { quote: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const initial = JSON.parse(JSON.stringify(rows)) as Lead[];

  return <LeadsTable initialRequests={initial} focusId={searchParams.focus} />;
}
