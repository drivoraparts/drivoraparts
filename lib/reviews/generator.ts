import { getProductById } from "@/lib/inventory";
import {
  getProductThumbnail,
  resolveProductGallery,
} from "@/lib/inventory/media";
import { products } from "@/lib/inventory/products";
import type { ProductReview } from "./types";

const AVATAR_COUNT = 24;

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

function fillProduct(template: string, productName: string): string {
  return template.replaceAll("{{product}}", productName);
}

const COMMENTS: Record<1 | 2 | 3 | 4 | 5, string[]> = {
  5: [
    "{{product}} showed up exactly as pictured. Clean unit and honest listing.",
    "Verified purchase on the {{product}} — fired right up after install.",
    "The {{product}} was crated well and matched every spec in the description.",
    "Super happy with my {{product}}. Seller communication was on point.",
    "Installed the {{product}} last weekend. Performance is exactly what I wanted.",
    "Tracked shipping the whole way. {{product}} arrived with zero damage.",
    "Best online parts buy I've had in a while. {{product}} looks great on the truck.",
    "Compression and leak-down on the {{product}} were right where they should be.",
    "Would buy this {{product}} again. Packaging was heavy duty and professional.",
    "The {{product}} bolted in without surprises. Listing photos were accurate.",
  ],
  4: [
    "{{product}} is solid overall. Took a few extra days but worth the wait.",
    "Happy with the {{product}}. Minor cosmetic mark but nothing that affects function.",
    "Good value on the {{product}}. Install notes could be a little clearer.",
    "The {{product}} runs strong. Delivery window ran a bit long.",
    "Overall pleased with the {{product}}. Would recommend with small caveats.",
    "Quality is there on the {{product}}. Dock scheduling took an extra day.",
    "Good experience buying the {{product}}. Support answered before I ordered.",
  ],
  3: [
    "The {{product}} works as described. Packaging was just average.",
    "Decent {{product}} for the price. Photos made it look slightly cleaner.",
    "Functional {{product}}. Middle-of-the-road experience overall.",
    "The {{product}} is okay. Expected a bit more detail in the listing.",
  ],
  2: [
    "Some cosmetic damage on the {{product}} but still usable.",
    "The {{product}} runs, but I had to chase missing hardware after unboxing.",
    "Not thrilled with the exterior finish on the {{product}}.",
    "Support was slow about a bent bracket on the {{product}}.",
  ],
  1: [
    "The {{product}} did not match the listing closely enough for me.",
    "Long delays and unclear updates on my {{product}} order.",
    "Had to dispute a missing component on the {{product}}.",
  ],
};

const PHOTO_COMMENTS: string[] = [
  "Added photos of the {{product}} right off the pallet — matches the listing.",
  "Uploaded a few pics after install. The {{product}} looks even better in person.",
  "See attached delivery photos. {{product}} was wrapped better than most freight I've seen.",
  "Dropped install photos below. Very happy with how the {{product}} turned out.",
  "Unboxing pics attached — {{product}} was complete and exactly as advertised.",
  "Photos from the shop floor. {{product}} cleaned up nice before we buttoned everything up.",
];

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

function shortProductName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 72) return trimmed;
  return `${trimmed.slice(0, 69)}…`;
}

function pickComment(
  rating: 1 | 2 | 3 | 4 | 5,
  rng: () => number,
  productName: string,
  withPhotos: boolean
): string {
  if (withPhotos) {
    const photoPool = PHOTO_COMMENTS;
    const template =
      photoPool[Math.floor(rng() * photoPool.length)] ?? photoPool[0];
    return fillProduct(template, productName);
  }

  const pool = COMMENTS[rating];
  const template = pool[Math.floor(rng() * pool.length)] ?? pool[0];
  return fillProduct(template, productName);
}

function buildAvatarUrl(reviewerName: string, index: number): string {
  const slot = (index % AVATAR_COUNT) + 1;
  return `/reviews/avatars/${String(slot).padStart(2, "0")}.jpg`;
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

function pickDeliveryPhotos(
  productId: number,
  rating: number,
  rng: () => number,
  index: number
): string[] | undefined {
  if (rating < 4) return undefined;
  if (index % 5 !== 0 && rng() > 0.32) return undefined;

  const product = getProductById(productId);
  if (!product) return undefined;

  const gallery = resolveProductGallery(
    getProductThumbnail(product),
    product.images
  ).filter((src) => src.startsWith("/product-media/") && !src.includes("default.svg"));

  if (gallery.length === 0) return undefined;

  const count = Math.min(gallery.length, rng() > 0.55 ? 3 : 2);
  const start = Math.floor(rng() * gallery.length);
  const picked: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const src = gallery[(start + i) % gallery.length];
    if (!picked.includes(src)) picked.push(src);
  }

  return picked.length > 0 ? picked : undefined;
}

export function getTargetReviewCount(productId: number): number {
  if (REVIEW_COUNT_OVERRIDES[productId]) {
    return REVIEW_COUNT_OVERRIDES[productId];
  }

  const rng = createRng(productId * 92821);
  return Math.floor(rng() * 150) + 1;
}

export function generateReviewsForProduct(productId: number): ProductReview[] {
  const product = getProductById(productId);
  const productName = shortProductName(product?.name ?? "this part");
  const count = getTargetReviewCount(productId);
  const rng = createRng(productId * 48271);
  const names = buildUniqueNames(count, rng);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return names.map((reviewerName, index) => {
    const rating = pickRating(rng);
    const photos = pickDeliveryPhotos(productId, rating, rng, index);
    const daysAgo = Math.floor(rng() * 540) + index;
    const createdAt = new Date(
      now - daysAgo * dayMs - index * 3600000
    ).toISOString();

    return {
      id: `rev-${productId}-${index + 1}`,
      userId: `seed-user-${productId}-${index + 1}`,
      productId,
      rating,
      review: pickComment(rating, rng, productName, Boolean(photos?.length)),
      verifiedPurchase: true,
      createdAt,
      reviewerName,
      profileImage: buildAvatarUrl(reviewerName, index),
      photos,
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
