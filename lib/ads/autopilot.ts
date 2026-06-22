import { getProductById } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";
import { detectViralProducts } from "@/lib/ai/viral-detector";
import { collectProductSignals } from "@/lib/ai/product-metrics";
import { safeQuery } from "@/lib/db/safe-query";

export type AutopilotAdPlatform = "tiktok" | "meta" | "google";

export type AutopilotAd = {
  productId: number;
  platform: AutopilotAdPlatform;
  hook: string;
  adCopy: string;
  script: string;
  cta: string;
  targeting: string[];
};

export type AutopilotReport = {
  generatedAt: number;
  trendingProductIds: number[];
  ads: AutopilotAd[];
  source: "live" | "fallback";
};

function buildTargeting(product: Product, cartRate: number): string[] {
  const targets = [
    product.category,
    product.brand ?? "performance",
    product.platform?.replace(/-/g, " ") ?? "auto parts",
    "car enthusiasts",
  ];

  if (cartRate >= 10) targets.push("high-intent shoppers");
  if (product.price >= 3000) targets.push("premium buyers");

  return [...new Set(targets.filter(Boolean))].slice(0, 6);
}

function buildTikTokAd(
  product: Product,
  metrics: { views: number; cartAdds: number; cartRate: number }
): AutopilotAd {
  const hook =
    metrics.cartAdds >= 5
      ? `Everyone is carting this ${product.brand?.toUpperCase() ?? "engine"} part`
      : `Stop scrolling — this ${product.category} upgrade is in stock`;

  return {
    productId: product.id,
    platform: "tiktok",
    hook,
    adCopy: `${hook}. ${product.name} · $${product.price.toLocaleString()} · ships from ${product.location}.`,
    script: [
      `[0s] ${hook}`,
      `[2s] POV: your project finally moves forward`,
      `[4s] ${product.name} — ${product.rating}★ · ${product.reviewCount}+ reviews`,
      `[6s] Tap before stock runs out`,
    ].join(" "),
    cta: "Shop Now",
    targeting: buildTargeting(product, metrics.cartRate),
  };
}

function buildMetaAd(
  product: Product,
  metrics: { views: number; cartAdds: number; cartRate: number; conversionRate: number }
): AutopilotAd {
  const hook = `In-stock ${product.name}`;

  return {
    productId: product.id,
    platform: "meta",
    hook,
    adCopy: `${hook}. OEM-grade ${product.category} component for serious builds. ${metrics.views} recent views, ${metrics.cartAdds} cart adds. Secure checkout with crypto support. Starting at $${product.price.toLocaleString()}.`,
    script: `Lead with proof: ${product.reviewCount}+ reviews at ${product.rating}★. Highlight fast fulfillment from ${product.location}. Close with limited inventory urgency.`,
    cta: "Buy Now",
    targeting: buildTargeting(product, metrics.cartRate),
  };
}

function buildGoogleAd(product: Product): AutopilotAd {
  const keywords = [
    product.brand ?? "performance",
    product.category,
    product.platform?.replace(/-/g, " ") ?? "",
    `${product.name.split(" ")[0]} parts`,
    "buy auto parts online",
  ].filter(Boolean);

  const hook = `${product.name} | In Stock`;

  return {
    productId: product.id,
    platform: "google",
    hook,
    adCopy: `Buy ${product.name}. ${product.condition} · $${product.price}. Fast shipping from ${product.location}. Trusted DrivoraParts catalog.`,
    script: `Search intent capture: headline + price + stock status + category keywords.`,
    cta: "Get Quote",
    targeting: [...new Set(keywords)].slice(0, 8),
  };
}

export async function generateAutopilotAds(
  limit = 5
): Promise<AutopilotReport> {
  const [viral, signals] = await Promise.all([
    safeQuery(() => detectViralProducts(limit), null, "autopilot-viral"),
    collectProductSignals(),
  ]);

  const signalMap = new Map(signals.map((s) => [s.productId, s]));

  const candidateIds =
    viral?.products.map((p) => p.productId) ??
    signals.slice(0, limit).map((s) => s.productId);

  const trendingProductIds = candidateIds.slice(0, limit);
  const ads: AutopilotAd[] = [];

  for (const productId of trendingProductIds) {
    const product = getProductById(productId);
    if (!product) continue;

    const metrics = signalMap.get(productId) ?? {
      views: 0,
      cartAdds: 0,
      cartRate: 0,
      conversionRate: 0,
      checkouts: 0,
      orders: 0,
      demandVelocity: 0,
      productId,
      name: product.name,
    };

    ads.push(buildTikTokAd(product, metrics));
    ads.push(buildMetaAd(product, metrics));
    ads.push(buildGoogleAd(product));
  }

  return {
    generatedAt: Date.now(),
    trendingProductIds,
    ads,
    source: ads.length ? "live" : "fallback",
  };
}

export async function generateAutopilotAdsForProduct(
  productId: number
): Promise<AutopilotAd[]> {
  const product = getProductById(productId);
  if (!product) return [];

  const signals = await collectProductSignals();
  const metrics = signals.find((s) => s.productId === productId) ?? {
    views: 0,
    cartAdds: 0,
    cartRate: 0,
    conversionRate: 0,
    checkouts: 0,
    orders: 0,
    demandVelocity: 0,
    productId,
    name: product.name,
  };

  return [
    buildTikTokAd(product, metrics),
    buildMetaAd(product, metrics),
    buildGoogleAd(product),
  ];
}
