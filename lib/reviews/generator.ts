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
    "Exactly what I needed for this build. No surprises.",
    "Quality feels right and it installed without any fitment issues.",
    "Clean unit and honest listing — would buy again.",
    "Runs strong after break-in. Very happy with this purchase.",
    "Better condition than I expected for the price.",
    "My shop was impressed with how clean it looked out of the box.",
    "Bolted up where it should and fired right up.",
    "Solid part. Does what the listing says it will do.",
    "Good value and the specs matched what I needed.",
    "Install went smoother than I thought it would.",
    "No missing hardware and everything lined up properly.",
    "Feels well built. Confidence is high after the first drive.",
    "Exactly as described. No hidden issues so far.",
    "Great pick for anyone doing a similar swap.",
    "Would recommend to a friend building the same platform.",
    "Happy with the purchase. Part looks legit.",
    "Checked everything against the listing — all matched.",
    "Strong performer so far. No complaints.",
    "Exactly the spec I was hunting for.",
    "Clean finish and tight tolerances where it counts.",
    "Mechanic said it looked good before we buttoned it up.",
    "No regrets on this one. Quality is there.",
    "Works great and the price was fair.",
    "Very satisfied. Does exactly what I bought it for.",
  ],
  4: [
    "Good part overall. Minor cosmetic stuff only.",
    "Works as it should. Solid buy for the money.",
    "Happy with it. Instructions could be clearer.",
    "Small scratch on the finish but function is fine.",
    "Would still recommend. Just double-check your fitment notes.",
    "Good quality. Took a little extra time to dial in.",
    "Does the job well. Not perfect, but close.",
    "Support answered my question before I ordered.",
    "Decent experience. Part itself is good.",
  ],
  3: [
    "It works. Nothing amazing, nothing terrible.",
    "Okay for the money. Listing was slightly optimistic.",
    "Middle of the road — gets the job done.",
    "Functional part. Expected a bit more polish.",
  ],
  2: [
    "Missing a small bracket in the box. Still usable.",
    "Finish wasn't great. Part works though.",
    "Had to chase support once. Part is okay.",
  ],
  1: [
    "Not what the listing described.",
    "Disappointed with the condition versus the photos.",
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
