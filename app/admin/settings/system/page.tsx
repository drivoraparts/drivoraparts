import { getAdminSystemSettings } from "@/lib/admin/system-settings";
import { isSupabaseConfigured } from "@/lib/env";
import SystemSettingsForm from "./SystemSettingsForm";

export const dynamic = "force-dynamic";

export default function AdminSystemSettingsPage() {
  const settings = getAdminSystemSettings();

  return (
    <SystemSettingsForm
      initialSiteUrl={settings.siteUrl}
      initialPaymentMode={settings.paymentMode}
      initialTawkEnabled={settings.tawkEnabled}
      nowpaymentsConfigured={settings.nowpaymentsConfigured}
      cryptomusConfigured={settings.cryptomusConfigured}
      analyticsReady={isSupabaseConfigured()}
    />
  );
}
