import {
  getAdminEmail,
  getAdminPassword,
  getAuthSecret,
} from "@/lib/auth/admin";

function required(name: string, devFallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (devFallback && process.env.NODE_ENV !== "production") return devFallback;
  throw new Error(`Missing required environment variable: ${name}`);
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export function getSupabaseUrl(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://placeholder.supabase.co"
  );
}

export function getSupabaseAnonKey(): string {
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (anon) return anon;
  if (process.env.NODE_ENV !== "production") return "placeholder-anon-key";
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
  );
}

export function getSupabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-key");
}

export { getAuthSecret, getAdminEmail, getAdminPassword };

export function getSiteUrl(): string {
  return optional("NEXT_PUBLIC_SITE_URL", "https://drivoraparts.com");
}

/** Optional Google Search Console HTML tag verification code. */
export function getGoogleSiteVerification(): string | null {
  return process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? null;
}

export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY ?? null;
}

export function getEmailFrom(): string {
  return optional("EMAIL_FROM", "orders@drivoraparts.com");
}

export function getNowPaymentsApiKey(): string | null {
  return process.env.NOWPAYMENTS_API_KEY ?? null;
}

export function getNowPaymentsIpnSecret(): string | null {
  return process.env.NOWPAYMENTS_IPN_SECRET ?? null;
}

/** NexaPay webhook HMAC secret -- verifies X-NexaPay-Signature on incoming
 * webhooks. Never log or expose this value. */
export function getNexaPayWebhookSecret(): string | null {
  return process.env.NEXAPAY_WEBHOOK_SECRET ?? null;
}

/** Separate NOWPayments account used for the (pending) fiat on-ramp. */
export function getNowPaymentsFiatApiKey(): string | null {
  return process.env.NOWPAYMENTS_FIAT_API_KEY ?? null;
}

export function getNowPaymentsFiatIpnSecret(): string | null {
  return process.env.NOWPAYMENTS_FIAT_IPN_SECRET ?? null;
}

export function getNowPaymentsButtonIid(): string {
  return process.env.NOWPAYMENTS_BUTTON_IID ?? "4682099423";
}

export function getCronSecret(): string | null {
  return process.env.CRON_SECRET ?? null;
}

export function getTawkPropertyId(): string {
  return optional("NEXT_PUBLIC_TAWK_PROPERTY_ID", "6a392868452f781d473b4ceb");
}

export function getTawkWidgetId(): string {
  return optional("NEXT_PUBLIC_TAWK_WIDGET_ID", "1jrs9hdba");
}

/** Fine-grained PAT scoped to this repo only, "Contents: Read and write". */
export function getGithubToken(): string | null {
  return process.env.GITHUB_TOKEN ?? null;
}

/** "owner/repo", e.g. "drivoraparts/drivoraparts". */
export function getGithubRepo(): string {
  return optional("GITHUB_REPO", "drivoraparts/drivoraparts");
}

/** Meta Pixel — drivoraparts event dataset (Events Manager). */
export const META_PIXEL_ID = "1275857431290062";

/** Meta (Facebook) Pixel ID — fixed so stale Cloudflare env cannot serve an old pixel. */
export function getMetaPixelId(): string {
  return META_PIXEL_ID;
}

/**
 * Meta Conversions API access token (server-only secret).
 * Required to send Purchase when payment completes on NOWPayments.
 * Create in Events Manager → Settings → Generate access token.
 */
export function getMetaCapiAccessToken(): string | null {
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  return token || null;
}

/** TikTok Pixel ID — Drivora Parts TikTok Ads Manager. */
export const TIKTOK_PIXEL_ID = "D934B6JC77UB3EFMUH9G";

/** GA4 Measurement ID (e.g. "G-XXXXXXXXXX") — null until set, component no-ops. */
export function getGaMeasurementId(): string | null {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;
}

/** Google Tag Manager container ID (e.g. "GTM-XXXXXXX") — null until set, component no-ops. */
export function getGtmContainerId(): string | null {
  return process.env.NEXT_PUBLIC_GTM_CONTAINER_ID?.trim() || null;
}

export function getTikTokPixelId(): string {
  return TIKTOK_PIXEL_ID;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  return Boolean(
    url &&
      serviceKey &&
      !url.includes("placeholder") &&
      !serviceKey.includes("placeholder")
  );
}
