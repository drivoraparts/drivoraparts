import { NextResponse } from "next/server";
import {
  getApprovedReviewCount,
  getApprovedReviewsByProductId,
  getAverageProductRating,
  getProductReviewAggregate,
  submitReview,
  type SubmitReviewInput,
} from "@/lib/reviews/store";
import { hasCompletedPurchase } from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/env";

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

  const reviews = getApprovedReviewsByProductId(productId, { offset, limit });
  const summary = getProductReviewAggregate(productId);

  return NextResponse.json({
    reviews,
    summary: {
      average: summary.rating,
      count: summary.reviewCount,
    },
  });
}

export async function POST(req: Request) {
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
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    if (!authorName.trim()) {
      return NextResponse.json({ error: "author_name is required" }, { status: 400 });
    }

    // Verified-purchase badge is only ever true when a real completed order
    // for this product/email exists — never trust anything the reviewer
    // submitted themselves for this. No email supplied just means an
    // ordinary (non-verified) review, same as before.
    const verifiedPurchase =
      email && isSupabaseConfigured()
        ? await hasCompletedPurchase(email, productId).catch(() => false)
        : false;

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

    const result = submitReview(input);
    if (result.ok === false) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      review: result.review,
      summary: {
        average: getAverageProductRating(productId),
        count: getApprovedReviewCount(productId),
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }
}
