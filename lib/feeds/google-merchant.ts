/* =========================================================
   GOOGLE MERCHANT CENTER PRODUCT FEED (tab-separated)
   ---------------------------------------------------------
   Same listings, fields and exclusions as the Meta feed
   (lib/feeds/meta-catalog.ts) -- a listing without a real
   photo, a price or a recorded condition is left out of both
   -- plus `shipping_label`, which Google Crawl cannot read off
   the product pages.

   shipping_label is the hook Merchant Center shipping services
   are keyed on: one service per label (parcel / multibox /
   freight), each with its own rate table. The values come from
   classifyProductShipping in lib/shipping/rates.ts, the same
   function that prices checkout, so a product cannot be rated
   one way on Google and charged another way here.
========================================================= */

import { getAllProducts } from "@/lib/inventory";
import type { Product } from "@/lib/inventory/types";
import { classifyProductShipping, type ShippingLabel } from "@/lib/shipping/rates";
import { toMetaCatalogFeedRow, type MetaCatalogFeedRow } from "./meta-catalog";

export const GOOGLE_MERCHANT_FEED_PATH = "/api/feeds/google-merchant.tsv";

export type GoogleMerchantFeedRow = MetaCatalogFeedRow & {
  shipping_label: ShippingLabel;
};

const GOOGLE_HEADERS: (keyof GoogleMerchantFeedRow)[] = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
  "google_product_category",
  "shipping_label",
];

/** Tabs and line breaks would split a field; nothing else needs escaping in TSV. */
function tsvClean(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

export function toGoogleMerchantFeedRow(product: Product): GoogleMerchantFeedRow | null {
  const base = toMetaCatalogFeedRow(product);
  if (!base) return null;
  return { ...base, shipping_label: classifyProductShipping(product).label };
}

export function buildGoogleMerchantFeedRows(): GoogleMerchantFeedRow[] {
  return getAllProducts()
    .map(toGoogleMerchantFeedRow)
    .filter((row): row is GoogleMerchantFeedRow => row != null);
}

export function renderGoogleMerchantTsv(rows: GoogleMerchantFeedRow[]): string {
  const lines = [
    GOOGLE_HEADERS.join("\t"),
    ...rows.map((row) => GOOGLE_HEADERS.map((key) => tsvClean(String(row[key] ?? ""))).join("\t")),
  ];
  return `${lines.join("\n")}\n`;
}

export function buildGoogleMerchantTsv(): string {
  return renderGoogleMerchantTsv(buildGoogleMerchantFeedRows());
}
