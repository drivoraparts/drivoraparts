import { headers } from "next/headers";
import AdminChatAssistant from "@/components/admin/AdminChatAssistant";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";
import { getAdminSession } from "@/lib/auth/require-admin";
import { isPublicAdminPath } from "@/lib/auth/public-routes";

function resolveAdminPathname(headerStore: Headers): string {
  return headerStore.get("x-pathname") ?? "";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const pathname = resolveAdminPathname(headerStore);
  const isPublic =
    headerStore.get("x-admin-public") === "1" || isPublicAdminPath(pathname);

  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <AdminErrorBoundary>{children}</AdminErrorBoundary>
      </div>
    );
  }

  const session = await getAdminSession();

  return (
    <AdminDashboardLayout>
      <AdminErrorBoundary>{children}</AdminErrorBoundary>
      {session ? <AdminChatAssistant /> : null}
    </AdminDashboardLayout>
  );
}
