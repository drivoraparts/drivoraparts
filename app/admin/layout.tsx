import { headers } from "next/headers";
import AdminChatAssistant from "@/components/admin/AdminChatAssistant";
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

  const session = isPublic ? null : await getAdminSession();

  return (
    <>
      <AdminErrorBoundary>{children}</AdminErrorBoundary>
      {session ? <AdminChatAssistant /> : null}
    </>
  );
}
