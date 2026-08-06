import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SubscribeResult = {
  ok: boolean;
  alreadySubscribed?: boolean;
  error?: string;
};

export async function subscribeToNewsletter(
  email: string,
  source?: string
): Promise<SubscribeResult> {
  const normalized = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: normalized, source: source ?? null });

  if (error) {
    // Unique violation on email = already subscribed, not a real error.
    if (error.code === "23505") {
      return { ok: true, alreadySubscribed: true };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, alreadySubscribed: false };
}
