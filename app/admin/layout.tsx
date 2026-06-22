import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminChatAssistant from "@/components/admin/AdminChatAssistant";
import { getAdminSession } from "@/lib/auth/require-admin";

const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const isPublic = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (!isPublic) {
    const session = await getAdminSession();
    if (!session) {
      redirect("/admin/login");
    }
  }

  return (
    <>
      {children}
      {!isPublic ? <AdminChatAssistant /> : null}
    </>
  );
}
