import { NextResponse } from "next/server";
import {
  getApprovedReviewCount,
  getApprovedReviewsByProductId,
  getAverageProductRating,
  getProductReviewAggregate,
  submitReview,
  type SubmitReviewInput,
} from "@/lib/reviews/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = Number(searchParams.get("product_id"));

  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  }

  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? 50) || 50)
  );
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);

  const [reviews, summary] = await Promise.all([
    getApprovedReviewsByProductId(productId, { offset, limit }),
    getProductReviewAggregate(productId),
  ]);

  return NextResponse.json({
    reviews,
    summary: {
      average: summary.rating,
      count: summary.reviewCount,
    },
  });
}

/*
 * REVIEW SUBMISSION IS CLOSED.
 *
 * Removing the form would only hide the button -- this endpoint is public, so
 * anything could still POST to it and land rows in product_reviews that no
 * part of the site invited. The gate belongs here, at the door.
 *
 * 403 rather than 404: the route exists and is coming back once there is a
 * customer base to write reviews. The body below is left intact for that.
 */
const REVIEWS_OPEN = false;

export async function POST(req: Request) {
  if (!REVIEWS_OPEN) {
    return NextResponse.json(
      { error: "Review submission is currently closed." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const productId = Number(body?.product_id ?? body?.productId);
    const rating = Number(body?.rating);
    const review = typeof body?.review === "string" ? body.review : body?.text;
    const authorName =
      typeof body?.author_name === "string"
        ? body.author_name
        : typeof body?.authorName === "string"
          ? body.authorName
          : "";

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    if (!authorName.trim()) {
      return NextResponse.json({ error: "author_name is required" }, { status: 400 });
    }

    /*
     * Never verified from this endpoint.
     *
     * This used to grant the Verified Buyer badge whenever the email typed into
     * the form belonged to someone with a completed order for the product. That
     * proves knowledge of a buyer's email address, not that the reviewer is the
     * buyer: anyone who knew it could post as them. Verification will come from
     * a single-use signed link emailed to the order's own address (step 2 of
     * the review system). Until then every public submission is unverified,
     * and the endpoint stays closed (REVIEWS_OPEN above).
     */
    const verifiedPurchase = false;

    const input: SubmitReviewInput = {
      productId,
      rating,
      review: review ?? "",
      context: {
        userId: `guest-${authorName.trim().toLowerCase().replace(/\s+/g, "-")}`,
        reviewerName: authorName.trim(),
        verifiedPurchase,
      },
    };

    const result = await submitReview(input);
    if (result.ok === false) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      review: result.review,
      summary: {
        average: await getAverageProductRating(productId),
        count: await getApprovedReviewCount(productId),
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }
}
