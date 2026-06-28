"use client";

import { useState } from "react";
import AdminSidebar, { ADMIN_NAV_LINKS } from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import { adminUi } from "./admin-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminDashboardShell({
  children,
  floatingUi,
}: {
  children: React.ReactNode;
  floatingUi?: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname() ?? "";

  return (
    <div className={`admin-theme ${adminUi.page}`}>
      <div className="flex min-h-screen">
        <div className="hidden md:flex">
          <AdminSidebar />
        </div>

        {mobileNavOpen ? (
          <>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white shadow-xl md:hidden">
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
                      onClick={() => setMobileNavOpen(false)}
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
          </>
        ) : null}

        <div className={adminUi.main}>
          <AdminTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className={adminUi.content}>{children}</main>
        </div>
      </div>
      {floatingUi}
    </div>
  );
}
