import { products } from "@/lib/inventory/products";
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

const RATING_DISTRIBUTION: Array<1 | 2 | 3 | 4 | 5> = [
  ...Array(55).fill(5),
  ...Array(28).fill(4),
  ...Array(10).fill(3),
  ...Array(5).fill(2),
  ...Array(2).fill(1),
] as Array<1 | 2 | 3 | 4 | 5>;

const COMMENTS: Record<1 | 2 | 3 | 4 | 5, string[]> = {
  5: [
    "Arrived earlier than expected. Box was beat up but the part inside was fine.",
    "Exactly what I ordered. No missing pieces in the shipment.",
    "Packaging was solid — double boxed and plenty of foam.",
    "Tracked the whole way. Driver called before delivery.",
    "Clean unit. Matches the listing photos.",
    "Installed over the weekend without any fitment drama.",
    "Seller responded quickly when I had a shipping question.",
    "Would buy here again. Honest listing.",
    "Freight company handled it well. No visible damage.",
    "Better condition than I expected for the price.",
    "All hardware was in the box. Nothing left out.",
    "Runs great after install. Very satisfied.",
    "Communication was clear from checkout to delivery.",
    "Label matched my order number. Easy to verify on receipt.",
    "Shop was happy with what showed up on the pallet.",
    "Good experience overall. Part looks legit.",
    "Wrapped well for LTL. Corners were protected.",
    "No surprises when we opened the crate.",
    "Quality feels right for this type of part.",
    "Fast processing after I paid.",
    "Showed up on a pallet just like the listing said.",
    "No rust, no hidden damage. Exactly as described.",
    "My mechanic said the unit looked clean.",
    "Checked serials against the invoice. All matched.",
  ],
  4: [
    "Good part. Shipping ran a couple days late.",
    "Small scratch on the finish but works fine.",
    "Solid buy. Instructions could be clearer.",
    "Dock took an extra day to schedule delivery.",
    "Happy with it. Minor cosmetic stuff only.",
    "Works as it should. Packaging was just average.",
    "Support got back to me before I ordered.",
    "Delivery window slipped but the part is fine.",
    "Would still recommend. Just plan extra time for freight.",
  ],
  3: [
    "It works. Nothing amazing, nothing terrible.",
    "Okay for the money. Listing was slightly optimistic.",
    "Middle of the road experience.",
    "Functional. Took longer to ship than quoted.",
  ],
  2: [
    "Missing a bracket in the box. Still usable.",
    "Finish wasn't great. Customer service was slow.",
    "Late delivery with minimal updates.",
  ],
  1: [
    "Not what the listing described.",
    "Long delay and poor communication.",
  ],
};

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

function pickUniqueComments(
  count: number,
  ratings: Array<1 | 2 | 3 | 4 | 5>,
  rng: () => number
): string[] {
  const used = new Set<string>();
  const comments: string[] = [];

  for (const rating of ratings) {
    const pool = shuffleWithRng(COMMENTS[rating], rng);
    const picked =
      pool.find((comment) => !used.has(comment)) ??
      `${pool[0]} (${comments.length + 1})`;
    used.add(picked);
    comments.push(picked);
  }

  return comments;
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
  const comments = pickUniqueComments(count, ratings, rng);
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
      review: comments[index] ?? COMMENTS[5][0],
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
