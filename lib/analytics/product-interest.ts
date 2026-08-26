import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { logError } from "@/lib/monitoring/logger";

/**
 * How many people actually looked at a product recently.
 *
 * This exists to give a listing some social proof without inventing any. The
 * figures are counted from real product_view events — the same events the
 * dashboard reports on — so anything shown to a customer is something that
 * genuinely happened.
 *
 * Counted in the database rather than fetched and tallied here: a product page
 * must not pull thirty days of events on every render.
 */

export const INTEREST_WINDOW_DAYS = 30;

/**
 * Below this a count says nothing worth saying, and "2 people viewed this"
 * reads worse than silence. Anything under the threshold shows nothing at all.
 */
export const MIN_VIEWS_TO_SHOW = 8;

export type ProductInterest = {
  views: number;
  cartAdds: number;
  windowDays: number;
};

async function countEvents(
  eventName: string,
  productId: number,
  sinceIso: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("name", eventName)
    .eq("payload->>productId", String(productId))
    .gte("created_at", sinceIso);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Returns null when there is nothing worth showing — no analytics, a quiet
 * product, or a failed lookup. Callers render nothing on null rather than a
 * zero, because "0 people viewed this" is not the reassurance we are after.
 */
export async function getProductInterest(
  productId: number
): Promise<ProductInterest | null> {
  if (!isSupabaseConfigured()) return null;

  const sinceIso = new Date(
    Date.now() - INTEREST_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  try {
    const [views, cartAdds] = await Promise.all([
      countEvents("product_view", productId, sinceIso),
      countEvents("add_to_cart", productId, sinceIso),
    ]);

    if (views < MIN_VIEWS_TO_SHOW) return null;

    return { views, cartAdds, windowDays: INTEREST_WINDOW_DAYS };
  } catch (error) {
    // Social proof is a nice-to-have; never let it break a product page.
    logError("product_interest_failed", error, { productId });
    return null;
  }
}
