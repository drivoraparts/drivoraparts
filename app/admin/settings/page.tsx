import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminUi } from "@/components/admin/admin-ui";
import { getAdminEmail } from "@/lib/auth/admin";
import { getAdminProfile } from "@/lib/admin/profile";
import { getAdminSystemSettings } from "@/lib/admin/system-settings";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

const sections = [
  {
    href: "/admin/settings/profile",
    title: "Profile",
    description: "Admin email and display name",
  },
  {
    href: "/admin/settings/security",
    title: "Security",
    description: "Password, sessions, and access control",
  },
  {
    href: "/admin/settings/system",
    title: "System",
    description: "Site URL, payments, Tawk, and integrations",
  },
];

export default function AdminSettingsPage() {
  const profile = getAdminProfile(getAdminEmail());
  const system = getAdminSystemSettings();
  const analyticsReady = isSupabaseConfigured();

  return (
    <AdminShell title="Settings">
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={adminUi.cardCompact}>
          <p className={adminUi.muted}>Signed in as</p>
          <p className="mt-1 font-medium text-zinc-900">{profile.displayName}</p>
          <p className="text-sm text-zinc-600">{profile.email}</p>
        </div>
        <div className={adminUi.cardCompact}>
          <p className={adminUi.muted}>Site URL</p>
          <p className="mt-1 font-medium text-zinc-900">{system.siteUrl}</p>
        </div>
        <div className={adminUi.cardCompact}>
          <p className={adminUi.muted}>System status</p>
          <p className="mt-1 font-medium text-emerald-700">Operational</p>
          <p className="text-sm text-zinc-600">Storefront and admin online</p>
        </div>
        <div className={adminUi.cardCompact}>
          <p className={adminUi.muted}>Payment mode</p>
          <p className="mt-1 font-medium text-zinc-900">{system.paymentMode}</p>
          <p className="text-sm text-zinc-600">
            {system.cryptomusConfigured ? "Cryptomus configured" : "Manual fallback"}
          </p>
        </div>
      </div>

      <section className={`mb-8 ${adminUi.card}`}>
        <h2 className="text-lg font-semibold text-zinc-900">Integration toggles</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-sm font-medium text-zinc-900">Tawk live chat</p>
            <p className={`mt-1 ${adminUi.muted}`}>
              {system.tawkEnabled ? "Enabled on storefront" : "Disabled on storefront"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-sm font-medium text-zinc-900">Cryptomus payments</p>
            <p className={`mt-1 ${adminUi.muted}`}>
              {system.cryptomusConfigured ? "Configured" : "Not configured"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-sm font-medium text-zinc-900">Analytics</p>
            <p className={`mt-1 ${adminUi.muted}`}>
              {analyticsReady ? "Supabase analytics connected" : "Using fallback metrics"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`${adminUi.card} transition hover:border-red-200 hover:shadow-md`}
          >
            <h2 className="text-lg font-semibold text-zinc-900">{section.title}</h2>
            <p className={`mt-2 ${adminUi.muted}`}>{section.description}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
