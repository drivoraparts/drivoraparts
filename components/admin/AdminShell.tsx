import Link from "next/link";
import AdminLogoutButton from "./AdminLogoutButton";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/insights", label: "AI Insights" },
  { href: "/admin/analytics", label: "Sales Analytics" },
  { href: "/admin/revenue", label: "Revenue" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/live-users", label: "Live Users" },
  { href: "/admin/forecast", label: "AI Forecast" },
  { href: "/admin/marketing", label: "Marketing Autopilot" },
  { href: "/admin/ads", label: "Ad Generator" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/products", label: "Products" },
];

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 text-white">
      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-red-500">
            DrivoraParts Admin
          </p>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <AdminLogoutButton />
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back to store
          </Link>
        </div>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm hover:border-red-500/40 hover:bg-white/[0.08]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

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
