import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import NewOrderForm from "@/components/admin/NewOrderForm";

export const dynamic = "force-dynamic";

export default function NewOrderPage() {
  if (!isAdmin()) redirect("/admin/login");
  return <NewOrderForm />;
}
