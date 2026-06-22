import { isSupabaseConfigured } from "@/lib/env";

export async function guardedSupabaseRead<T>(
  label: string,
  fallback: T,
  fn: () => Promise<T>
): Promise<T> {
  if (!isSupabaseConfigured()) {
    console.warn(`[db:${label}] Supabase not configured — using fallback data`);
    return fallback;
  }

  try {
    return await fn();
  } catch (error) {
    console.error(`[db:${label}]`, error);
    return fallback;
  }
}
