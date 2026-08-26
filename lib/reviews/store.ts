import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { logError } from "@/lib/monitoring/logger";
import type {
  ProductReview,
  ReviewModerationAction,
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
  };
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
        status: "approved",
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
