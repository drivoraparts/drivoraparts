export type PaymentMode = "auto" | "cryptomus" | "manual";

export type AdminSystemSettings = {
  siteUrl: string;
  paymentMode: PaymentMode;
  tawkEnabled: boolean;
  cryptomusConfigured: boolean;
};

let runtimeSettings: {
  paymentMode: PaymentMode;
  tawkEnabled: boolean;
} = {
  paymentMode: "auto",
  tawkEnabled: true,
};

export function getAdminSystemSettings(): AdminSystemSettings {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://drivoraparts.com";
  const cryptomusConfigured = Boolean(
    process.env.CRYPTOMUS_MERCHANT_ID && process.env.CRYPTOMUS_PAYMENT_KEY
  );

  return {
    siteUrl,
    paymentMode: runtimeSettings.paymentMode,
    tawkEnabled: runtimeSettings.tawkEnabled,
    cryptomusConfigured,
  };
}

export function updateAdminSystemSettings(patch: {
  paymentMode?: PaymentMode;
  tawkEnabled?: boolean;
}): AdminSystemSettings {
  if (patch.paymentMode) runtimeSettings.paymentMode = patch.paymentMode;
  if (typeof patch.tawkEnabled === "boolean") {
    runtimeSettings.tawkEnabled = patch.tawkEnabled;
  }
  return getAdminSystemSettings();
}

export function isTawkEnabledForStore(): boolean {
  return runtimeSettings.tawkEnabled;
}

export function getEffectivePaymentMode(): PaymentMode {
  const settings = getAdminSystemSettings();
  if (settings.paymentMode === "auto") {
    return settings.cryptomusConfigured ? "cryptomus" : "manual";
  }
  return settings.paymentMode;
}
