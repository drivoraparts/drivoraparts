import AdminDashboardShell from "./AdminDashboardShell";

export default function AdminDashboardLayout({
  children,
  floatingUi,
}: {
  children: React.ReactNode;
  floatingUi?: React.ReactNode;
}) {
  return (
    <AdminDashboardShell floatingUi={floatingUi}>{children}</AdminDashboardShell>
  );
}
