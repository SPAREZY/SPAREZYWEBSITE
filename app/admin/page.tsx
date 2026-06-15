import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getDashboardData } from "@/lib/admin-stats";
import Dashboard from "@/components/admin/Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!isAdmin()) redirect("/admin/login");
  const data = await getDashboardData();
  return <Dashboard data={data} />;
}
