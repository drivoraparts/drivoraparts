"use client";

import { usePathname } from "next/navigation";
import AdminLogoutButton from "./AdminLogoutButton";
import { adminUi } from "./admin-ui";
import { ADMIN_NAV_LINKS } from "./AdminSidebar";

function resolveTitle(pathname: string): string {
  const match = ADMIN_NAV_LINKS.find(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`)
  );
  if (match) return match.label;

  if (pathname.startsWith("/admin/settings/profile")) return "Profile Settings";
  if (pathname.startsWith("/admin/settings/security")) return "Security Settings";
  if (pathname.startsWith("/admin/settings/system")) return "System Settings";

  return "Admin";
}

export default function AdminTopBar({
  onOpenMobileNav,
}: {
  onOpenMobileNav?: () => void;
}) {
  const pathname = usePathname() ?? "";

  return (
    <header className={adminUi.topBar}>
      <div className="flex items-center gap-3">
        {onOpenMobileNav ? (
          <button
            type="button"
            aria-label="Open navigation menu"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 md:hidden"
            onClick={onOpenMobileNav}
          >
            Menu
          </button>
        ) : null}
        <div>
          <p className={adminUi.kicker}>DrivoraParts Admin</p>
          <p className="text-lg font-semibold text-zinc-900">{resolveTitle(pathname)}</p>
        </div>
      </div>
      <AdminLogoutButton />
    </header>
  );
}
