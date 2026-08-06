export type ReviewStatus = "approved" | "hidden" | "pending";

export type ProductReview = {
  id: string;
  userId: string;
  productId: number;
  rating: number;
  review: string;
  verifiedPurchase: boolean;
  createdAt: string;
  profileImage?: string;
  reviewerName: string;
  status: ReviewStatus;
};

export type ReviewModerationAction = "approve" | "hide" | "delete";

export type ReviewSubmissionContext = {
  userId: string;
  reviewerName: string;
  profileImage?: string;
  /** Must be derived from a real completed-order lookup — never trust a
   *  caller-supplied claim of "verified" for this. See
   *  lib/db/orders.ts:hasCompletedPurchase. */
  verifiedPurchase: boolean;
};
