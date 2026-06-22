import AdminLogoutButton from "./AdminLogoutButton";

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-red-500">Admin</p>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          <AdminLogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export { StatCard };
