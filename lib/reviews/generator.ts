import { products } from "@/lib/inventory/products";
import type { ProductReview } from "./types";

const FIRST_NAMES = [
  "John",
  "Mike",
  "David",
  "Alex",
  "Chris",
  "Daniel",
  "Ryan",
  "James",
  "Mark",
  "Luke",
  "Brian",
  "Kevin",
  "Jason",
  "Eric",
  "Matt",
  "Nick",
  "Adam",
  "Scott",
  "Tyler",
  "Jordan",
  "Justin",
  "Brandon",
  "Aaron",
  "Kyle",
  "Sean",
  "Patrick",
  "Derek",
  "Greg",
  "Ian",
  "Marcus",
];

const LAST_NAMES = [
  "Carter",
  "Thompson",
  "Williams",
  "Johnson",
  "Brown",
  "Smith",
  "Wilson",
  "Taylor",
  "Anderson",
  "Miller",
  "Davis",
  "Martinez",
  "Robinson",
  "Clark",
  "Lewis",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "King",
  "Wright",
  "Scott",
  "Green",
  "Baker",
  "Adams",
  "Nelson",
  "Hill",
  "Moore",
  "Reed",
  "Cook",
];

const RATING_DISTRIBUTION: Array<1 | 2 | 3 | 4 | 5> = [
  ...Array(40).fill(5),
  ...Array(30).fill(4),
  ...Array(15).fill(3),
  ...Array(10).fill(2),
  ...Array(5).fill(1),
] as Array<1 | 2 | 3 | 4 | 5>;

const COMMENTS: Record<1 | 2 | 3 | 4 | 5, string[]> = {
  5: [
    "Engine arrived clean and exactly as described. Compression test was perfect.",
    "Packaging was solid and the unit matched the listing photos perfectly.",
    "Smooth transaction from checkout to delivery. Would buy again.",
    "Exactly what I needed for my build. Fired right up after install.",
    "Professional seller communication and fast shipping.",
    "Unit was complete, clean, and ready for the swap bay.",
    "Very happy with the condition. Better than I expected honestly.",
    "Tracked shipping the whole way and zero surprises on arrival.",
    "Great experience overall. Engine looks brand new.",
    "Install went smooth and performance is exactly as advertised.",
    "Top notch listing quality. Verified purchase was worth it.",
    "Crating was heavy duty and nothing was damaged in transit.",
    "Matched every spec in the description. No complaints at all.",
    "Seller answered my questions quickly before I pulled the trigger.",
    "One of the cleanest units I have bought online.",
  ],
  4: [
    "Great engine overall, minor shipping delay but worth it.",
    "Solid purchase. Took a few extra days but condition was excellent.",
    "Very good engine, just wish the paperwork arrived a bit sooner.",
    "Happy with the build quality. Small cosmetic mark on the cover.",
    "Good value for the price. Install support could be clearer.",
    "Engine runs strong. Delivery window was slightly longer than quoted.",
    "Overall pleased. Packaging could use a little more padding.",
    "Quality is there. Communication was good not great.",
    "Would recommend. Minor accessory was missing but they shipped it fast.",
    "Strong unit and fair price. Dock scheduling took an extra day.",
    "Good experience. A little more detail on harness routing would help.",
    "Performs well so far. Shipping carrier held it over a weekend.",
  ],
  3: [
    "Good condition but expected slightly better packaging.",
    "Engine is fine, just not as spotless as the photos suggested.",
    "Decent purchase. Some surface rust on non-critical hardware.",
    "Works as described. Average experience nothing special.",
    "Acceptable for the price. Install notes were a bit vague.",
    "Functional unit. Took longer to coordinate pickup than expected.",
    "Middle of the road experience. Engine itself seems okay.",
    "Okay overall. Expected more photos of accessory components.",
  ],
  2: [
    "Some cosmetic damage but still functional.",
    "Had to replace a few bolts after unboxing. Engine itself seems fine.",
    "Not terrible but shipping left a few scratches on the valve cover.",
    "Runs but I had issues with missing hardware in the crate.",
    "Disappointed with exterior finish. Internals looked okay.",
    "Support was slow to respond about a bent bracket.",
  ],
  1: [
    "Not satisfied, had issues with communication.",
    "Order status updates were inconsistent and frustrating.",
    "Unit did not match the description closely enough for me.",
    "Had to dispute a missing component. Would not repeat.",
    "Long delays and unclear answers from support.",
  ],
};

/** Fixed counts for flagship listings; others use deterministic 1–150 spread. */
const REVIEW_COUNT_OVERRIDES: Record<number, number> = {
  1: 97,
  34: 143,
  39: 121,
  40: 127,
  42: 74,
  43: 68,
  46: 61,
  49: 98,
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

function pickComment(rating: 1 | 2 | 3 | 4 | 5, rng: () => number, productId: number, index: number): string {
  const pool = COMMENTS[rating];
  const base = pool[Math.floor(rng() * pool.length)] ?? pool[0];
  const suffix =
    index % 7 === 0 ? ` Order #${10000 + productId * 10 + index}.` : "";
  return `${base}${suffix}`;
}

function buildAvatarUrl(fullName: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1f1f1f&color=e5e5e5&size=128&bold=true`;
}

function buildUniqueNames(count: number, rng: () => number): string[] {
  const combos: string[] = [];
  for (const first of FIRST_NAMES) {
    for (const last of LAST_NAMES) {
      combos.push(`${first} ${last}`);
    }
  }

  const shuffled = shuffleWithRng(combos, rng);
  if (count <= shuffled.length) {
    return shuffled.slice(0, count);
  }

  const names = [...shuffled];
  let i = 0;
  while (names.length < count) {
    names.push(`${shuffled[i % shuffled.length]} ${names.length + 1}`);
    i += 1;
  }
  return names;
}

export function getTargetReviewCount(productId: number): number {
  if (REVIEW_COUNT_OVERRIDES[productId]) {
    return REVIEW_COUNT_OVERRIDES[productId];
  }

  const rng = createRng(productId * 92821);
  return Math.floor(rng() * 150) + 1;
}

export function generateReviewsForProduct(productId: number): ProductReview[] {
  const count = getTargetReviewCount(productId);
  const rng = createRng(productId * 48271);
  const names = buildUniqueNames(count, rng);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return names.map((reviewerName, index) => {
    const rating = pickRating(rng);
    const daysAgo = Math.floor(rng() * 540) + index;
    const createdAt = new Date(now - daysAgo * dayMs - index * 3600000).toISOString();

    return {
      id: `rev-${productId}-${index + 1}`,
      userId: `seed-user-${productId}-${index + 1}`,
      productId,
      rating,
      review: pickComment(rating, rng, productId, index),
      verifiedPurchase: true,
      createdAt,
      reviewerName,
      profileImage: buildAvatarUrl(reviewerName),
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
