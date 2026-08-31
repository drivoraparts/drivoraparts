import { NextResponse } from "next/server";
import {
  createAdminReview,
  getReviewStoreSnapshot,
  moderateReview,
  REVIEW_SOURCE_LABELS,
  type ReviewModerationAction,
  type ReviewSource,
} from "@/lib/reviews";
import { hasCompletedPurchase } from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/env";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { logWarn } from "@/lib/monitoring/logger";

/**
 * Admin moderation for product reviews.
 *
 * The store has had moderateReview() since reviews moved to the database, but
 * nothing ever called it — reviews could be written and never triaged. This is
 * the missing surface, and it is admin-guarded: moderation decides what appears
 * next to a product, so it must never be reachable from the storefront.
 */

const ACTIONS: ReviewModerationAction[] = ["approve", "hide", "delete"];

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const reviews = await getReviewStoreSnapshot();

  return NextResponse.json({
    reviews,
    counts: {
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      hidden: reviews.filter((r) => r.status === "hidden").length,
    },
  });
}

/**
 * Records a review a customer left off-site — WhatsApp, Instagram, in person.
 *
 * The admin transcribes what a real customer said; the source and the admin's
 * own email are stored with it. Verified-purchase is looked up here from the
 * orders table and is never read from the request, so no form field can grant
 * that badge.
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);

  const productId = Number(body?.productId);
  const rating = Number(body?.rating);
  const review = typeof body?.review === "string" ? body.review : "";
  const reviewerName =
    typeof body?.reviewerName === "string" ? body.reviewerName : "";
  const source = body?.source as ReviewSource;
  const customerEmail =
    typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
  const collectedAt =
    typeof body?.collectedAt === "string" && body.collectedAt
      ? new Date(body.collectedAt).toISOString()
      : null;

  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "Choose a product." }, { status: 400 });
  }

  if (!(source in REVIEW_SOURCE_LABELS)) {
    return NextResponse.json({ error: "Choose a valid source." }, { status: 400 });
  }

  // Derived, never accepted. An email with no completed order simply yields an
  // ordinary unverified review.
  const verifiedPurchase =
    customerEmail && isSupabaseConfigured()
      ? await hasCompletedPurchase(customerEmail, productId).catch(() => false)
      : false;

  const result = await createAdminReview({
    productId,
    rating,
    review,
    reviewerName,
    source,
    // tsconfig runs with strict:false, so the requireAdminApi union does not
    // narrow after the guard above — read through the optional chain rather
    // than assuming the session branch.
    enteredBy: auth.session?.email ?? "admin",
    collectedAt,
    verifiedPurchase,
  });

  if (result.ok === false) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    review: result.review,
    verifiedPurchase,
    // Told plainly, so an admin who expected the badge knows why it is absent.
    verificationNote: customerEmail
      ? verifiedPurchase
        ? "Matched to a completed order."
        : "No completed order found for that email — saved as unverified."
      : "No email given, so the review is unverified.",
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const reviewId = typeof body?.reviewId === "string" ? body.reviewId : "";
  const action = body?.action as ReviewModerationAction;

  if (!reviewId) {
    return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
  }

  if (!ACTIONS.includes(action)) {
    logWarn("review_moderate_invalid_action", { action: String(action) });
    return NextResponse.json(
      { error: `action must be one of: ${ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  const review = await moderateReview(reviewId, action);

  // moderateReview returns undefined for both "no such review" and a failed
  // write. Reporting success either way would let the dashboard show a review
  // as approved when nothing changed.
  if (!review && action !== "delete") {
    return NextResponse.json(
      { error: "Review not found, or the update could not be saved." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, review: review ?? null });
}
