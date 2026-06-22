import { adminUi } from "@/components/admin/admin-ui";

export default function AdminLoading() {
  return (
    <div className={`flex min-h-[40vh] items-center justify-center ${adminUi.page}`}>
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-red-600" />
        <p className={`mt-4 ${adminUi.muted}`}>Loading admin dashboard...</p>
      </div>
    </div>
  );
}
