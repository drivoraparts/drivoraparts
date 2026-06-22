"use client";

import { usePathname, useRouter } from "next/navigation";
import AdminLogoutButton from "./AdminLogoutButton";

export const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/insights", label: "AI Insights" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/revenue", label: "Revenue" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/live-users", label: "Live Users" },
  { href: "/admin/forecast", label: "AI Forecast" },
  { href: "/admin/marketing", label: "Marketing" },
  { href: "/admin/ads", label: "Ad Generator" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/40">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-400">
          DrivoraParts
        </p>
        <p className="mt-2 text-lg font-semibold text-white">Admin Console</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV_LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <button
              key={link.href}
              type="button"
              onClick={() => router.push(link.href)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                active
                  ? "bg-red-600/20 text-white ring-1 ring-red-500/40"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
