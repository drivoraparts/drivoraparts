import AdminChatAssistant from "@/components/admin/AdminChatAssistant";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AdminChatAssistant />
    </>
  );
}
