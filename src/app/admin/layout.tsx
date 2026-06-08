import { AdminDashboardFrame } from "@/app/admin/_components/AdminDashboardFrame";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDashboardFrame>{children}</AdminDashboardFrame>;
}
