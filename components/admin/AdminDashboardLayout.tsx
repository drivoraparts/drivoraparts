import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import { adminUi } from "./admin-ui";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`admin-theme ${adminUi.page}`}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className={adminUi.main}>
          <AdminTopBar />
          <main className={adminUi.content}>{children}</main>
        </div>
      </div>
    </div>
  );
}
