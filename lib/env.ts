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
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", "placeholder-anon-key");
}

export function getSupabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-key");
}

export { getAuthSecret, getAdminEmail, getAdminPassword };

export function getSiteUrl(): string {
  return optional("NEXT_PUBLIC_SITE_URL", "https://drivoraparts.com");
}

export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY ?? null;
}

export function getEmailFrom(): string {
  return optional("EMAIL_FROM", "orders@drivoraparts.com");
}

export function getCryptomusMerchantId(): string | null {
  return process.env.CRYPTOMUS_MERCHANT_ID ?? null;
}

export function getCryptomusPaymentKey(): string | null {
  return process.env.CRYPTOMUS_PAYMENT_KEY ?? null;
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
