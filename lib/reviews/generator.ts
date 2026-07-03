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
  "Elijah",
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
];

const LAST_NAMES = [
  "Adams",
  "Baker",
  "Brooks",
  "Campbell",
  "Carter",
  "Clark",
  "Collins",
  "Cooper",
  "Davis",
  "Edwards",
  "Evans",
  "Foster",
  "Garcia",
  "Gray",
  "Hall",
  "Harris",
  "Hayes",
  "Hill",
  "Howard",
  "Hughes",
  "Jackson",
  "Johnson",
  "Kelly",
  "King",
  "Lee",
  "Lewis",
  "Long",
  "Martin",
  "Miller",
  "Mitchell",
];

/** Mostly 4–5 stars, occasional middling/negative reviews. */
const RATING_DISTRIBUTION: Array<1 | 2 | 3 | 4 | 5> = [
  ...Array(52).fill(5),
  ...Array(28).fill(4),
  ...Array(10).fill(3),
  ...Array(6).fill(2),
  ...Array(4).fill(1),
] as Array<1 | 2 | 3 | 4 | 5>;

const COMMENTS: Record<1 | 2 | 3 | 4 | 5, string[]> = {
  5: [
    "Showed up on time and matched the listing photos. No surprises at all.",
    "Packaging was heavy duty. Unit looked clean straight out of the crate.",
    "Install went smoother than expected. Everything bolted up where it should.",
    "Seller answered my fitment question before I ordered. That helped a lot.",
    "Exactly what I needed for the build. Would order from here again.",
    "Freight was tracked the whole way. Part arrived with zero damage.",
    "Honest listing. Compression and leak-down numbers were right on the money.",
    "Better experience than my last online parts purchase, hands down.",
    "Quality is there. You can tell this was handled like a real powertrain part.",
    "Fast turnaround and solid communication. Very happy with this buy.",
    "Looks even cleaner in person than the photos suggested.",
    "No missing hardware. Manual and accessories were all accounted for.",
    "Shop guys were impressed with the condition when it landed.",
    "Price was fair for what showed up. No bait-and-switch nonsense.",
    "Runs strong after break-in. Exactly what the listing promised.",
  ],
  4: [
    "Good part overall. Shipping took a few extra days but worth the wait.",
    "Small cosmetic scuff on the housing, nothing that affects function.",
    "Install notes could be clearer, but the unit itself is solid.",
    "Dock scheduling was a little slow, product quality is still there.",
    "Happy with the purchase. Would recommend with minor caveats.",
    "Runs well. Packaging was average but the part was protected fine.",
    "Support replied before I pulled the trigger on the order. Appreciated that.",
    "Minor paint chip on arrival, function is 100% though.",
  ],
  3: [
    "Works as described. Experience was just middle of the road overall.",
    "Decent for the price. Listing made it look a touch cleaner than it is.",
    "Functional unit. Expected a bit more detail in the write-up.",
    "Got the job done. Nothing special good or bad.",
  ],
  2: [
    "Had to chase down a missing bracket after unboxing.",
    "Some exterior finish issues, still usable but not thrilled.",
    "Support was slow getting back about a bent flange.",
    "Longer lead time than quoted at checkout.",
  ],
  1: [
    "Listing details did not match what showed up.",
    "Order updates were unclear and the delay dragged on.",
    "Had to dispute a missing component with support.",
  ],
};

const REVIEW_COUNT_OVERRIDES: Record<number, number> = {
  1: 47,
  34: 63,
  39: 58,
  40: 71,
  42: 39,
  43: 34,
  46: 31,
  49: 44,
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

function pickComment(rating: 1 | 2 | 3 | 4 | 5, rng: () => number): string {
  const pool = COMMENTS[rating];
  return pool[Math.floor(rng() * pool.length)] ?? pool[0];
}

/** Stable portrait per reviewer name — local randomuser.me downloads. */
function buildAvatarUrl(reviewerName: string): string {
  const slot = (hashString(reviewerName) % AVATAR_COUNT) + 1;
  return `/reviews/avatars/${String(slot).padStart(2, "0")}.jpg`;
}

function buildUniqueNames(count: number, rng: () => number): string[] {
  const combos: string[] = [];
  for (const first of FIRST_NAMES) {
    for (const last of LAST_NAMES) {
      combos.push(`${first} ${last[0]}.`);
    }
  }

  const shuffled = shuffleWithRng(combos, rng);
  if (count <= shuffled.length) {
    return shuffled.slice(0, count);
  }

  const names = [...shuffled];
  let suffix = 2;
  while (names.length < count) {
    const base = shuffled[names.length % shuffled.length];
    names.push(`${base.replace(/\.$/, "")}${suffix}.`);
    suffix += 1;
  }
  return names;
}

export function getTargetReviewCount(productId: number): number {
  if (REVIEW_COUNT_OVERRIDES[productId]) {
    return REVIEW_COUNT_OVERRIDES[productId];
  }

  const rng = createRng(productId * 92821);
  return Math.floor(rng() * 72) + 9;
}

export function generateReviewsForProduct(productId: number): ProductReview[] {
  const count = getTargetReviewCount(productId);
  const rng = createRng(productId * 48271);
  const names = buildUniqueNames(count, rng);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return names.map((reviewerName, index) => {
    const rating = pickRating(rng);
    const daysAgo = Math.floor(rng() * 365) + index;
    const createdAt = new Date(
      now - daysAgo * dayMs - index * 3600000
    ).toISOString();

    return {
      id: `rev-${productId}-${index + 1}`,
      userId: `seed-user-${productId}-${index + 1}`,
      productId,
      rating,
      review: pickComment(rating, rng),
      verifiedPurchase: rng() < 0.85,
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
