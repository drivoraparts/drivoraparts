export const runtime = 'edge';

import { getAdminEmail } from "@/lib/auth/admin";
import { getAdminProfile } from "@/lib/admin/profile";
import ProfileSettingsForm from "./ProfileSettingsForm";

export const dynamic = "force-dynamic";

export default function AdminProfileSettingsPage() {
  const email = getAdminEmail();
  const profile = getAdminProfile(email);

  return (
    <ProfileSettingsForm email={email} initialDisplayName={profile.displayName} />
  );
}
