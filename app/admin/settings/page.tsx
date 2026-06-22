import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminEmail } from "@/lib/auth/admin";
import { getAdminProfile } from "@/lib/admin/profile";
import { getAdminSystemSettings } from "@/lib/admin/system-settings";

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
    description: "Site URL, payments, and chat widget",
  },
];

export default function AdminSettingsPage() {
  const profile = getAdminProfile(getAdminEmail());
  const system = getAdminSystemSettings();

  return (
    <AdminShell title="Settings">
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-zinc-400">Signed in as</p>
          <p className="mt-1 font-medium">{profile.displayName}</p>
          <p className="text-sm text-zinc-500">{profile.email}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-zinc-400">Site URL</p>
          <p className="mt-1 font-medium">{system.siteUrl}</p>
          <p className="text-sm text-zinc-500">
            Payment mode: {system.paymentMode}
            {system.paymentMode === "auto"
              ? ` (${system.cryptomusConfigured ? "Cryptomus ready" : "manual fallback"})`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-red-500/40 hover:bg-white/[0.06]"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{section.description}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
