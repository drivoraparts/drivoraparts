export type ReviewStatus = "approved" | "hidden" | "pending";

/**
 * Where a review's words came from.
 *
 * "storefront" is the customer typing it themselves. Everything else was said
 * somewhere off-site and transcribed by an admin, which is legitimate only
 * because the origin is recorded and shown — see migration 014.
 */
export type ReviewSource =
  | "storefront"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "email"
  | "in_person"
  | "other";

export const REVIEW_SOURCE_LABELS: Record<ReviewSource, string> = {
  storefront: "Website",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  email: "Email",
  in_person: "In person",
  other: "Other",
};

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
  /** Defaults to "storefront" until migration 014 has run. */
  source: ReviewSource;
  /** Admin who transcribed it; null for customer-submitted reviews. */
  enteredBy?: string | null;
  /** When the customer actually said it, if different from when it was entered. */
  collectedAt?: string | null;
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
