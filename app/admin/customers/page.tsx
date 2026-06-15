import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getCustomers } from "@/lib/customers";
import CustomersTable from "@/components/admin/CustomersTable";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  if (!isAdmin()) redirect("/admin/login");
  const customers = await getCustomers();
  return <CustomersTable customers={customers} />;
}
