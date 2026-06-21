import type {
  ProductReview,
  ReviewModerationAction,
  ReviewSubmissionContext,
} from "./types";

const DEFAULT_AVATAR = "/catalog/avatars/default.svg";

const seedReviews: ProductReview[] = [
  {
    id: "rev-s58-1",
    userId: "user-1042",
    productId: 40,
    rating: 5,
    review:
      "Engine arrived exactly as described. Packaging was professional and the unit was clean, complete, and ready for install.",
    verifiedPurchase: true,
    createdAt: "2026-02-14T10:20:00.000Z",
    reviewerName: "John M.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-s58-2",
    userId: "user-2218",
    productId: 40,
    rating: 5,
    review:
      "Outstanding communication and fast logistics. The S58 matched the listing photos and fired up without issue.",
    verifiedPurchase: true,
    createdAt: "2026-01-28T16:05:00.000Z",
    reviewerName: "Daniel R.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-2jz-1",
    userId: "user-3301",
    productId: 34,
    rating: 5,
    review:
      "Legendary platform delivered in premium condition. Exactly what you expect from a top-tier marketplace listing.",
    verifiedPurchase: true,
    createdAt: "2026-02-02T09:15:00.000Z",
    reviewerName: "Marcus T.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-2jz-2",
    userId: "user-4410",
    productId: 34,
    rating: 5,
    review:
      "Verified purchase experience from checkout to delivery. Engine presentation and documentation were excellent.",
    verifiedPurchase: true,
    createdAt: "2026-01-19T13:40:00.000Z",
    reviewerName: "Alex P.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-n54-1",
    userId: "user-5521",
    productId: 1,
    rating: 5,
    review:
      "Clean N54 unit with strong build quality. Shipping was tracked end-to-end and arrived on schedule.",
    verifiedPurchase: true,
    createdAt: "2026-02-08T11:00:00.000Z",
    reviewerName: "Chris L.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-rb26-1",
    userId: "user-6632",
    productId: 39,
    rating: 5,
    review:
      "RB26 arrived securely crated and matched the premium listing details. Very confident purchase.",
    verifiedPurchase: true,
    createdAt: "2026-01-30T08:50:00.000Z",
    reviewerName: "Kenji S.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-k20-1",
    userId: "user-7743",
    productId: 42,
    rating: 5,
    review:
      "Perfect swap candidate. Condition was brand new as advertised and the VTEC platform is flawless.",
    verifiedPurchase: true,
    createdAt: "2026-02-10T15:25:00.000Z",
    reviewerName: "Tyler W.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-k24-1",
    userId: "user-8854",
    productId: 43,
    rating: 5,
    review:
      "Strong low-end torque and excellent presentation. Verified buyer process gave me full confidence.",
    verifiedPurchase: true,
    createdAt: "2026-02-05T12:10:00.000Z",
    reviewerName: "Jordan H.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-s58-3",
    userId: "user-9965",
    productId: 40,
    rating: 4,
    review:
      "Great engine and professional handling. Install scheduling took an extra day but overall very satisfied.",
    verifiedPurchase: true,
    createdAt: "2026-01-12T18:30:00.000Z",
    reviewerName: "Ethan B.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
  {
    id: "rev-2jz-3",
    userId: "user-1076",
    productId: 34,
    rating: 5,
    review:
      "One of the cleanest 2JZ listings I have seen. DrivoraParts checkout and delivery were seamless.",
    verifiedPurchase: true,
    createdAt: "2026-01-08T07:45:00.000Z",
    reviewerName: "Ryan C.",
    profileImage: DEFAULT_AVATAR,
    status: "approved",
  },
];

let reviewStore: ProductReview[] = [...seedReviews];

export function getApprovedReviewsByProductId(
  productId: number,
  options?: { offset?: number; limit?: number }
): ProductReview[] {
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 5;

  return reviewStore
    .filter(
      (review) => review.productId === productId && review.status === "approved"
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(offset, offset + limit);
}

export function getApprovedReviewCount(productId: number): number {
  return reviewStore.filter(
    (review) => review.productId === productId && review.status === "approved"
  ).length;
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
  const reviews = reviewStore.filter(
    (review) =>
      review.productId === productId &&
      review.status === "approved" &&
      review.verifiedPurchase
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
    id: `rev-${productId}-${Date.now()}`,
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
