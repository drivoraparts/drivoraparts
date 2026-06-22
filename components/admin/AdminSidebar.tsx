"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminUi } from "./admin-ui";

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
  const pathname = usePathname() ?? "";

  return (
    <aside className={adminUi.sidebar}>
      <div className={adminUi.sidebarBrand}>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-600">
          DrivoraParts
        </p>
        <p className="mt-2 text-lg font-semibold text-zinc-900">Admin Console</p>
      </div>

      <nav className={adminUi.sidebarNav}>
        {ADMIN_NAV_LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              className={`${adminUi.navLink} ${
                active ? adminUi.navLinkActive : adminUi.navLinkIdle
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
