import { getAdminSystemSettings } from "@/lib/admin/system-settings";
import SystemSettingsForm from "./SystemSettingsForm";

export const dynamic = "force-dynamic";

export default function AdminSystemSettingsPage() {
  const settings = getAdminSystemSettings();

  return (
    <SystemSettingsForm
      initialSiteUrl={settings.siteUrl}
      initialPaymentMode={settings.paymentMode}
      initialTawkEnabled={settings.tawkEnabled}
      cryptomusConfigured={settings.cryptomusConfigured}
    />
  );
}
