import { products } from "@/lib/inventory/products";
import { buildProductComments } from "./product-comments";
import type { ProductReview } from "./types";

const AVATAR_COUNT = 96;

const FIRST_NAMES = [
  "Marcus",
  "Jordan",
  "Tyler",
  "Brandon",
  "Derek",
  "Kevin",
  "Ryan",
  "Justin",
  "Aaron",
  "Carlos",
  "Ethan",
  "Noah",
  "Liam",
  "Mason",
  "Logan",
  "Aiden",
  "Lucas",
  "Nathan",
  "Caleb",
  "Travis",
  "Shawn",
  "Andre",
  "Jamal",
  "Diego",
  "Rafael",
  "Colton",
  "Brody",
  "Trevor",
  "Wesley",
  "Eric",
  "Adam",
  "Nick",
  "Luke",
  "John",
  "Matt",
  "Daniel",
  "Ian",
  "Sean",
  "Patrick",
  "Greg",
  "Scott",
  "Kyle",
  "Brian",
  "Chris",
  "Alex",
  "David",
];

const LAST_INITIALS = "ABCDEFGHJKLMNPRSTUVW".split("");

/** Mostly 4–5 stars; low ratings use soft, minor nitpicks only. */
const RATING_DISTRIBUTION: Array<1 | 2 | 3 | 4 | 5> = [
  ...Array(58).fill(5),
  ...Array(28).fill(4),
  ...Array(10).fill(3),
  ...Array(3).fill(2),
  ...Array(1).fill(1),
] as Array<1 | 2 | 3 | 4 | 5>;

const REVIEW_COUNT_OVERRIDES: Record<number, number> = {
  1: 18,
  34: 22,
  39: 19,
  40: 24,
  42: 14,
  43: 12,
  46: 11,
  49: 16,
};

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffleWithRng<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRating(rng: () => number): 1 | 2 | 3 | 4 | 5 {
  const index = Math.floor(rng() * RATING_DISTRIBUTION.length);
  return RATING_DISTRIBUTION[index] ?? 5;
}

function buildUniqueNames(count: number, rng: () => number): string[] {
  const combos: string[] = [];
  for (const first of FIRST_NAMES) {
    for (const initial of LAST_INITIALS) {
      combos.push(`${first} ${initial}.`);
    }
  }

  const shuffled = shuffleWithRng(combos, rng);
  return shuffled.slice(0, count);
}

function buildAvatarUrl(reviewId: string): string {
  const slot = (hashString(reviewId) % AVATAR_COUNT) + 1;
  return `/reviews/avatars/${String(slot).padStart(2, "0")}.jpg`;
}

export function getTargetReviewCount(productId: number): number {
  if (REVIEW_COUNT_OVERRIDES[productId]) {
    return REVIEW_COUNT_OVERRIDES[productId];
  }

  const rng = createRng(productId * 92821);
  return Math.floor(rng() * 13) + 6;
}

export function generateReviewsForProduct(productId: number): ProductReview[] {
  const count = getTargetReviewCount(productId);
  const rng = createRng(productId * 48271);
  const names = buildUniqueNames(count, rng);
  const ratings = Array.from({ length: count }, () => pickRating(rng));
  const comments = buildProductComments(productId, count, ratings, rng);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return names.map((reviewerName, index) => {
    const rating = ratings[index] ?? 5;
    const reviewId = `rev-${productId}-${index + 1}`;
    const daysAgo = Math.floor(rng() * 320) + index * 3 + 1;

    return {
      id: reviewId,
      userId: `seed-user-${productId}-${index + 1}`,
      productId,
      rating,
      review: comments[index] ?? comments[0] ?? "Good purchase.",
      verifiedPurchase: rng() < 0.82,
      createdAt: new Date(now - daysAgo * dayMs).toISOString(),
      reviewerName,
      profileImage: buildAvatarUrl(reviewId),
      status: "approved",
    };
  });
}

export function generateEngineCatalogReviews(): ProductReview[] {
  const engineProductIds = products
    .filter((product) => product.category === "engine")
    .map((product) => product.id);

  return engineProductIds.flatMap((productId) =>
    generateReviewsForProduct(productId)
  );
}
