import { getProductById } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";
import { collectProductSignals } from "@/lib/ai/product-metrics";

export type SocialContentPack = {
  productId: number;
  productName: string;
  tiktokCaption: string;
  instagramCaption: string;
  facebookMarketplaceDescription: string;
  seoDescription: string;
  trendingKeywords: string[];
  generatedAt: number;
};

export type ContentBatchReport = {
  generatedAt: number;
  packs: SocialContentPack[];
  source: "live" | "fallback";
};

function trendingKeywords(product: Product, cartRate: number, views: number): string[] {
  const base = [
    product.brand ?? "performance",
    product.category,
    product.platform?.replace(/-/g, " ") ?? "",
    `${product.condition} auto parts`,
    "engine swap",
    "aftermarket parts",
  ];

  if (cartRate >= 8) base.push("trending auto parts", "in stock now");
  if (views >= 15) base.push("popular upgrade");
  if (product.price >= 5000) base.push("premium engine");

  return [...new Set(base.filter(Boolean))].slice(0, 10);
}

function buildPack(
  product: Product,
  metrics: { views: number; cartAdds: number; cartRate: number }
): SocialContentPack {
  const keywords = trendingKeywords(product, metrics.cartRate, metrics.views);
  const price = `$${product.price.toLocaleString()}`;
  const keywordLine = keywords.slice(0, 4).join(" · ");

  return {
    productId: product.id,
    productName: product.name,
    tiktokCaption: `🔥 ${product.name} is LIVE\n${price} · ${product.location}\n${metrics.cartAdds}+ added to cart this week\n#${(product.brand ?? "cars").replace(/\s/g, "")} #${product.category} #enginebuild #drivoraparts`,
    instagramCaption: `${product.name}\n\n${product.rating}★ rated · ${product.reviewCount}+ reviews\n${price} · ${product.condition}\nShips from ${product.location}\n\nTap link in bio — limited stock.\n\n${keywordLine}`,
    facebookMarketplaceDescription: `${product.name}\n\nCondition: ${product.condition}\nPrice: ${price}\nLocation: ${product.location}\n\nOEM-grade ${product.category} part for performance builds. Verified catalog listing on DrivoraParts with secure checkout.\n\nKeywords: ${keywords.join(", ")}`,
    seoDescription: `Buy ${product.name} online at DrivoraParts. ${product.condition} ${product.category} for ${product.platform?.replace(/-/g, " ") ?? "performance builds"}. ${product.rating}★ rating, fast shipping from ${product.location}. Price ${price}.`,
    trendingKeywords: keywords,
    generatedAt: Date.now(),
  };
}

export async function generateSocialContentBatch(
  productIds?: number[],
  limit = 6
): Promise<ContentBatchReport> {
  const signals = await collectProductSignals();
  const ids =
    productIds?.length ?
      productIds
    : signals.slice(0, limit).map((s) => s.productId);

  const signalMap = new Map(signals.map((s) => [s.productId, s]));
  const packs: SocialContentPack[] = [];

  for (const id of ids) {
    const product = getProductById(id);
    if (!product) continue;

    const metrics = signalMap.get(id) ?? {
      views: 0,
      cartAdds: 0,
      cartRate: 0,
      conversionRate: 0,
      checkouts: 0,
      orders: 0,
      demandVelocity: 0,
      productId: id,
      name: product.name,
    };

    packs.push(buildPack(product, metrics));
  }

  return {
    generatedAt: Date.now(),
    packs,
    source: packs.length ? "live" : "fallback",
  };
}

export async function generateSocialContentForProduct(
  productId: number
): Promise<SocialContentPack | null> {
  const batch = await generateSocialContentBatch([productId], 1);
  return batch.packs[0] ?? null;
}
