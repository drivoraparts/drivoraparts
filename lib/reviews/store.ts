import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { logError } from "@/lib/monitoring/logger";
import type {
  ProductReview,
  ReviewModerationAction,
  ReviewSource,
  ReviewSubmissionContext,
} from "./types";

const DEFAULT_AVATAR = "/reviews/avatars/01.jpg";
const TABLE = "product_reviews";

/**
 * Real reviews, stored in the database.
 *
 * Two things were wrong here. The store was a module-level array, so on
 * Workers — where each request can land in a fresh isolate — a review a
 * customer submitted was gone by the next page load. And a generator refilled
 * that array on every cold start with invented reviewers, which is what hid
 * the problem: the page always looked populated, so nobody noticed that
 * nothing written to it survived.
 *
 * Reads and writes now go to Supabase. Every function is async as a result;
 * callers were updated to match. With Supabase unconfigured, reads return
 * empty and writes fail with a message rather than pretending to succeed.
 */

type ReviewRow = {
  id: string;
  product_id: number;
  user_id: string;
  reviewer_name: string;
  rating: number;
  review: string;
  verified_purchase: boolean;
  profile_image: string | null;
  status: ProductReview["status"];
  created_at: string;
  // Added by migration 014. Absent on rows written before it ran, so every
  // read below tolerates undefined rather than assuming the column exists.
  source?: ReviewSource | null;
  entered_by?: string | null;
  collected_at?: string | null;
};

function toReview(row: ReviewRow): ProductReview {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    rating: row.rating,
    review: row.review,
    verifiedPurchase: row.verified_purchase,
    createdAt: row.created_at,
    profileImage: row.profile_image ?? DEFAULT_AVATAR,
    reviewerName: row.reviewer_name,
    status: row.status,
    source: row.source ?? "storefront",
    enteredBy: row.entered_by ?? null,
    collectedAt: row.collected_at ?? null,
  };
}

/**
 * PostgREST rejects an insert naming a column it does not know about, with
 * PGRST204, before Postgres ever sees the statement. Writing provenance
 * unconditionally would therefore take review submission down entirely until
 * migration 014 is run. Retrying without those keys keeps reviews working
 * either way; only the provenance waits for the migration.
 */
function isUnknownColumnError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "PGRST204";
}

async function fetchApproved(productId: number): Promise<ProductReview[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => toReview(row as ReviewRow));
  } catch (error) {
    // A reviews outage must not take the product page down with it.
    logError("reviews_fetch_failed", error, { productId });
    return [];
  }
}

export async function getApprovedReviewsByProductId(
  productId: number,
  options?: { offset?: number; limit?: number }
): Promise<ProductReview[]> {
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 5;
  const reviews = await fetchApproved(productId);
  return reviews.slice(offset, offset + limit);
}

export async function getApprovedReviewCount(productId: number): Promise<number> {
  return (await fetchApproved(productId)).length;
}

export async function getAverageProductRating(productId: number): Promise<number> {
  const reviews = await fetchApproved(productId);
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export async function getProductReviewAggregate(productId: number): Promise<{
  rating: number;
  reviewCount: number;
}> {
  const reviews = await fetchApproved(productId);
  if (reviews.length === 0) return { rating: 0, reviewCount: 0 };

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    reviewCount: reviews.length,
    rating: Math.round((total / reviews.length) * 10) / 10,
  };
}

/** Basic eligibility to submit at all (guest reviews are allowed) — this is
 *  intentionally NOT the same check as verified-purchase status. */
export function canSubmitReview(context: ReviewSubmissionContext): boolean {
  return Boolean(context.userId) && Boolean(context.reviewerName?.trim());
}

export async function getVerifiedBuyerAvatars(
  productId: number,
  limit = 4
): Promise<string[]> {
  const reviews = (await fetchApproved(productId)).filter(
    (review) => review.verifiedPurchase
  );

  const avatars: string[] = [];
  const seen = new Set<string>();

  for (const review of reviews) {
    const avatar = review.profileImage || DEFAULT_AVATAR;
    if (seen.has(avatar)) continue;
    seen.add(avatar);
    avatars.push(avatar);
    if (avatars.length >= limit) break;
  }

  return avatars;
}

export type SubmitReviewInput = {
  productId: number;
  rating: number;
  review: string;
  context: ReviewSubmissionContext;
};

export type SubmitReviewResult =
  | { ok: true; review: ProductReview }
  | { ok: false; error: string };

export async function submitReview(
  input: SubmitReviewInput
): Promise<SubmitReviewResult> {
  const { productId, rating, review, context } = input;

  if (!canSubmitReview(context)) {
    return { ok: false, error: "A name is required to submit a review." };
  }

  if (rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5 stars." };
  }

  if (!review.trim()) {
    return { ok: false, error: "Review text is required." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Reviews are unavailable right now. Please try again later.",
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        product_id: productId,
        user_id: context.userId,
        reviewer_name: context.reviewerName,
        rating,
        review: review.trim(),
        // Comes straight from the caller's real completed-order lookup — never
        // re-derive this from anything the reviewer submitted themselves.
        verified_purchase: context.verifiedPurchase,
        profile_image: context.profileImage || DEFAULT_AVATAR,
        /*
         * Held for moderation rather than published on submit.
         *
         * getApprovedReviewsByProductId only reads status = 'approved', so a
         * new review is invisible on the storefront until an admin releases it
         * in /admin/reviews. A shop with no review history cannot afford to
         * publish unmoderated text next to a $10,000 engine, and the reviewer
         * is told plainly that it is awaiting review rather than left thinking
         * the form failed.
         */
        status: "pending",
      })
      .select("*")
      .single();

    if (error) throw error;
    return { ok: true, review: toReview(data as ReviewRow) };
  } catch (error) {
    logError("review_submit_failed", error, { productId });
    return {
      ok: false,
      error: "We couldn't save your review. Please try again.",
    };
  }
}

export type AdminReviewInput = {
  productId: number;
  rating: number;
  review: string;
  reviewerName: string;
  source: ReviewSource;
  /** Admin email, recorded so a transcribed review is never anonymous. */
  enteredBy: string;
  /** When the customer actually said it. */
  collectedAt?: string | null;
  /**
   * Derived by the caller from hasCompletedPurchase(). Never taken from the
   * form -- an admin cannot mark their own entry as a verified purchase.
   */
  verifiedPurchase: boolean;
};

/**
 * Records a review a customer gave somewhere off-site.
 *
 * Enters as "pending" like any other, so a transcribed review still passes
 * through moderation rather than appearing because staff typed it.
 */
export async function createAdminReview(
  input: AdminReviewInput
): Promise<SubmitReviewResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Reviews are unavailable right now." };
  }

  const rating = Math.round(Number(input.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5." };
  }
  if (!input.review.trim()) {
    return { ok: false, error: "Review text is required." };
  }
  if (!input.reviewerName.trim()) {
    return { ok: false, error: "Customer name is required." };
  }
  if (input.source === "storefront") {
    // Storefront means the customer typed it themselves, which is exactly what
    // this path did not happen. Allowing it would erase the distinction the
    // provenance column exists to preserve.
    return { ok: false, error: "Choose where the customer left this review." };
  }

  const base = {
    product_id: input.productId,
    user_id: `offsite-${input.source}-${input.reviewerName.trim().toLowerCase().replace(/\s+/g, "-")}`,
    reviewer_name: input.reviewerName.trim(),
    rating,
    review: input.review.trim(),
    verified_purchase: input.verifiedPurchase,
    profile_image: DEFAULT_AVATAR,
    status: "pending" as const,
  };

  const provenance = {
    source: input.source,
    entered_by: input.enteredBy,
    collected_at: input.collectedAt || null,
  };

  try {
    const supabase = getSupabaseAdmin();

    const attempt = await supabase
      .from(TABLE)
      .insert({ ...base, ...provenance })
      .select("*")
      .single();

    if (!attempt.error) {
      return { ok: true, review: toReview(attempt.data as ReviewRow) };
    }

    if (!isUnknownColumnError(attempt.error)) throw attempt.error;

    // Migration 014 has not run. Save the review rather than lose the
    // customer's words, and surface that provenance could not be stored.
    const fallback = await supabase.from(TABLE).insert(base).select("*").single();
    if (fallback.error) throw fallback.error;

    logError(
      "review_provenance_column_missing",
      new Error("Run supabase/migrations/014_review_provenance.sql"),
      { productId: input.productId }
    );

    return { ok: true, review: toReview(fallback.data as ReviewRow) };
  } catch (error) {
    logError("admin_review_create_failed", error, { productId: input.productId });
    return { ok: false, error: "We couldn't save that review. Please try again." };
  }
}

export async function moderateReview(
  reviewId: string,
  action: ReviewModerationAction
): Promise<ProductReview | undefined> {
  if (!isSupabaseConfigured()) return undefined;

  try {
    const supabase = getSupabaseAdmin();

    if (action === "delete") {
      const { data, error } = await supabase
        .from(TABLE)
        .delete()
        .eq("id", reviewId)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? toReview(data as ReviewRow) : undefined;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ status: action === "approve" ? "approved" : "hidden" })
      .eq("id", reviewId)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    return data ? toReview(data as ReviewRow) : undefined;
  } catch (error) {
    logError("review_moderate_failed", error, { reviewId, action });
    return undefined;
  }
}

export async function getReviewStoreSnapshot(): Promise<ProductReview[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    return (data ?? []).map((row) => toReview(row as ReviewRow));
  } catch (error) {
    logError("review_snapshot_failed", error);
    return [];
  }
}

export { DEFAULT_AVATAR };
