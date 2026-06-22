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

export function getTawkPropertyId(): string {
  return optional("NEXT_PUBLIC_TAWK_PROPERTY_ID", "6a384bd1d0dd3e1d406c8132");
}

export function getTawkWidgetId(): string {
  return optional("NEXT_PUBLIC_TAWK_WIDGET_ID", "default");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );
}
