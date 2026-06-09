import { AdminDashboardFrame } from "@/app/admin/_components/AdminDashboardFrame";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    redirect("/admin/login");
  }

  return <AdminDashboardFrame>{children}</AdminDashboardFrame>;
}
