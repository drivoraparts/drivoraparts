import { generateEngineCatalogReviews, generateReviewsForProduct } from "./generator";
import type {
  ProductReview,
  ReviewModerationAction,
  ReviewSubmissionContext,
} from "./types";

const DEFAULT_AVATAR = "/catalog/avatars/default.svg";

let reviewStore: ProductReview[] = generateEngineCatalogReviews();

function ensureSeededReviews(productId: number): void {
  const hasReviews = reviewStore.some((review) => review.productId === productId);
  if (!hasReviews) {
    reviewStore.push(...generateReviewsForProduct(productId));
  }
}

function getApprovedReviews(productId: number): ProductReview[] {
  ensureSeededReviews(productId);

  return reviewStore
    .filter(
      (review) => review.productId === productId && review.status === "approved"
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getApprovedReviewsByProductId(
  productId: number,
  options?: { offset?: number; limit?: number }
): ProductReview[] {
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 5;

  return getApprovedReviews(productId).slice(offset, offset + limit);
}

export function getApprovedReviewCount(productId: number): number {
  return getApprovedReviews(productId).length;
}

export function getAverageProductRating(productId: number): number {
  const reviews = getApprovedReviews(productId);
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function getProductReviewAggregate(productId: number): {
  rating: number;
  reviewCount: number;
} {
  const reviewCount = getApprovedReviewCount(productId);
  return {
    reviewCount,
    rating: reviewCount > 0 ? getAverageProductRating(productId) : 0,
  };
}

export function canSubmitReview(
  context: ReviewSubmissionContext,
  productId: number
): boolean {
  return (
    Boolean(context.userId) &&
    context.hasAccount &&
    context.emailVerified &&
    context.paymentCompleted &&
    context.completedProductIds.includes(productId)
  );
}

export function isVerifiedPurchaseReview(
  context: ReviewSubmissionContext,
  productId: number
): boolean {
  return canSubmitReview(context, productId);
}

export function getVerifiedBuyerAvatars(
  productId: number,
  limit = 4
): string[] {
  const reviews = getApprovedReviews(productId).filter(
    (review) => review.verifiedPurchase
  );

  const avatars: string[] = [];
  for (const review of reviews) {
    const avatar = review.profileImage || DEFAULT_AVATAR;
    if (!avatars.includes(avatar)) avatars.push(avatar);
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

export function submitReview(input: SubmitReviewInput): SubmitReviewResult {
  const { productId, rating, review, context } = input;

  if (!canSubmitReview(context, productId)) {
    return {
      ok: false,
      error:
        "Only logged-in verified buyers with a completed purchase can submit a review.",
    };
  }

  if (rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5 stars." };
  }

  if (!review.trim()) {
    return { ok: false, error: "Review text is required." };
  }

  const newReview: ProductReview = {
    id: `rev-live-${productId}-${Date.now()}`,
    userId: context.userId,
    productId,
    rating,
    review: review.trim(),
    verifiedPurchase: isVerifiedPurchaseReview(context, productId),
    createdAt: new Date().toISOString(),
    reviewerName: context.reviewerName,
    profileImage: context.profileImage || DEFAULT_AVATAR,
    status: "approved",
  };

  reviewStore.unshift(newReview);
  return { ok: true, review: newReview };
}

export function moderateReview(
  reviewId: string,
  action: ReviewModerationAction
): ProductReview | undefined {
  const index = reviewStore.findIndex((review) => review.id === reviewId);
  if (index === -1) return undefined;

  if (action === "delete") {
    const [removed] = reviewStore.splice(index, 1);
    return removed;
  }

  reviewStore[index] = {
    ...reviewStore[index],
    status: action === "approve" ? "approved" : "hidden",
  };

  return reviewStore[index];
}

export function getReviewStoreSnapshot(): ProductReview[] {
  return [...reviewStore];
}

export { DEFAULT_AVATAR };
