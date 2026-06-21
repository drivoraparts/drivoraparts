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
  hasAccount: boolean;
  emailVerified: boolean;
  completedProductIds: number[];
};
