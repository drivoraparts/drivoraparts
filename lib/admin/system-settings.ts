export type PaymentMode = "auto" | "nowpayments" | "manual";

export type AdminSystemSettings = {
  siteUrl: string;
  paymentMode: PaymentMode;
  tawkEnabled: boolean;
  nowpaymentsConfigured: boolean;
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
  const nowpaymentsConfigured = Boolean(
    process.env.NOWPAYMENTS_API_KEY && process.env.NOWPAYMENTS_IPN_SECRET
  );

  return {
    siteUrl,
    paymentMode: runtimeSettings.paymentMode,
    tawkEnabled: runtimeSettings.tawkEnabled,
    nowpaymentsConfigured,
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
    return "nowpayments";
  }
  return settings.paymentMode;
}
