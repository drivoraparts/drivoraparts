import { listAnalyticsEvents } from "@/lib/db/analytics";
import { safeQuery } from "@/lib/db/safe-query";
import { getProductById } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";

export type FacebookAdVariant = {
  headline: string;
  primaryText: string;
  callToAction: string;
};

export type GoogleAdVariant = {
  headline: string;
  description: string;
  keywords: string[];
};

export type AdPack = {
  productId: number;
  productName: string;
  generatedAt: number;
  facebookAds: FacebookAdVariant[];
  googleAds: GoogleAdVariant[];
  tiktokScript: string;
  exportMeta: {
    platformReady: ["facebook", "google", "tiktok"];
    format: "json";
    version: "1.0";
  };
};

function buildFacebookAds(product: Product, views: number, cartAdds: number): FacebookAdVariant[] {
  const price = `$${product.price.toLocaleString()}`;
  const socialProof =
    product.reviewCount > 0
      ? `${product.reviewCount}+ reviews · ${product.rating}★`
      : "Trusted by performance builders";

  return [
    {
      headline: `${product.name} — In Stock Now`,
      primaryText: `Upgrade your build with OEM-grade ${product.category} parts. ${socialProof}. Ships from ${product.location}. Starting at ${price}.`,
      callToAction: "Shop Now",
    },
    {
      headline: `Performance ${product.brand?.toUpperCase() ?? "Parts"} Deal`,
      primaryText: `${views} shoppers viewed this ${product.category} part this month. ${cartAdds} added to cart. Secure checkout + fast fulfillment at DrivoraParts.`,
      callToAction: "Get Yours",
    },
    {
      headline: "Don't Wait on Backorder",
      primaryText: `Stop hunting forums for ${product.name}. Verified fitment, transparent pricing (${price}), and checkout in minutes. Built for serious enthusiasts.`,
      callToAction: "Buy Today",
    },
  ];
}

function buildGoogleAds(product: Product): GoogleAdVariant[] {
  const brand = product.brand ?? "performance";
  const platform = product.platform?.replace(/-/g, " ") ?? product.category;

  return [
    {
      headline: `${product.name} | DrivoraParts`,
      description: `Buy ${platform} ${product.category} parts with fast shipping. OEM quality. Price ${product.price}.`,
      keywords: [brand, product.category, platform, "auto parts", "performance parts"],
    },
    {
      headline: `${brand.toUpperCase()} ${product.category} Parts Online`,
      description: `Shop ${product.name}. In-stock ${product.condition} condition. Secure checkout & support.`,
      keywords: [`${brand} parts`, `${product.category} upgrade`, "car parts online"],
    },
    {
      headline: "Performance Parts — Fast Shipping",
      description: `${product.name} available now. Trusted catalog, real inventory, transparent pricing.`,
      keywords: ["performance engine parts", "aftermarket parts", product.category],
    },
  ];
}

function buildTikTokScript(product: Product, cartAdds: number): string {
  return [
    `[HOOK] POV: you finally found ${product.name} in stock.`,
    `[PROBLEM] Everyone else is on backorder — you're still searching Facebook groups.`,
    `[PROOF] ${cartAdds}+ buyers already carted this. ${product.rating}★ rated.`,
    `[OFFER] DrivoraParts — ${product.price} · ships from ${product.location}.`,
    `[CTA] Tap link. Build season doesn't wait.`,
  ].join(" ");
}

export async function generateAdPack(productId: number): Promise<AdPack | null> {
  const product = getProductById(productId);
  if (!product) return null;

  const events = await safeQuery(
    () => listAnalyticsEvents(2000),
    [],
    "ads-generator-events"
  );

  let views = 0;
  let cartAdds = 0;

  for (const event of events) {
    if (Number(event.payload?.productId) !== productId) continue;
    if (event.name === "product_view") views += 1;
    if (event.name === "add_to_cart") cartAdds += 1;
  }

  return {
    productId,
    productName: product.name,
    generatedAt: Date.now(),
    facebookAds: buildFacebookAds(product, views, cartAdds),
    googleAds: buildGoogleAds(product),
    tiktokScript: buildTikTokScript(product, cartAdds),
    exportMeta: {
      platformReady: ["facebook", "google", "tiktok"],
      format: "json",
      version: "1.0",
    },
  };
}
