import { NextResponse } from "next/server";
import {
  getReviewStoreSnapshot,
  moderateReview,
  type ReviewModerationAction,
} from "@/lib/reviews";
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
