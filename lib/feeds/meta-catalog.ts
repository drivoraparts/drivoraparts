import { BASE_CURRENCY } from "@/lib/currency/constants";
import {
  getAllProducts,
  getBrandBySlug,
  getProductThumbnail,
  resolveProductCondition,
} from "@/lib/inventory";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/inventory/media";
import type { Product } from "@/lib/inventory/types";
import { absoluteImageUrl, absoluteUrl } from "@/lib/seo";
import { productSeoDescription } from "@/lib/seo/text";

export const META_CATALOG_FEED_PATH = "/api/feeds/meta-catalog.csv";

export type MetaCatalogFeedRow = {
  id: string;
  title: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new" | "refurbished" | "used";
  price: string;
  link: string;
  image_link: string;
  brand: string;
  google_product_category?: string;
};

const META_HEADERS: (keyof MetaCatalogFeedRow)[] = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "google_product_category",
];

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function metaCondition(product: Product): MetaCatalogFeedRow["condition"] {
  const condition = resolveProductCondition(product);
  if (condition === "brand-new") return "new";
  if (condition === "refurbished") return "refurbished";
  return "used";
}

function metaAvailability(product: Product): MetaCatalogFeedRow["availability"] {
  return product.stock === false ? "out of stock" : "in stock";
}

function metaDescription(product: Product): string {
  const fallback = `${product.name} — performance automotive part from DrivoraParts.`;
  if (!product.description?.trim()) return fallback.slice(0, 5000);
  return productSeoDescription(product.description, fallback).slice(0, 5000);
}

function metaBrand(product: Product): string {
  return getBrandBySlug(product.brand)?.name ?? product.brand;
}

function metaPrice(product: Product): string {
  return `${product.price.toFixed(2)} ${BASE_CURRENCY}`;
}

function isFeedReadyImage(src: string): boolean {
  return Boolean(src && src !== DEFAULT_PRODUCT_IMAGE && !src.includes("default.svg"));
}

export function toMetaCatalogFeedRow(product: Product): MetaCatalogFeedRow | null {
  const image = getProductThumbnail(product);
  if (!isFeedReadyImage(image)) return null;

  return {
    id: String(product.id),
    title: product.name.slice(0, 200),
    description: metaDescription(product),
    availability: metaAvailability(product),
    condition: metaCondition(product),
    price: metaPrice(product),
    link: absoluteUrl(`/product/${product.id}`),
    image_link: absoluteImageUrl(image),
    brand: metaBrand(product).slice(0, 100),
    google_product_category: "5613",
  };
}

export function buildMetaCatalogFeedRows(): MetaCatalogFeedRow[] {
  return getAllProducts()
    .map(toMetaCatalogFeedRow)
    .filter((row): row is MetaCatalogFeedRow => row != null);
}

export function renderMetaCatalogCsv(rows: MetaCatalogFeedRow[]): string {
  const lines = [
    META_HEADERS.join(","),
    ...rows.map((row) =>
      META_HEADERS.map((key) => csvEscape(row[key] ?? "")).join(",")
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export function buildMetaCatalogCsv(): string {
  return renderMetaCatalogCsv(buildMetaCatalogFeedRows());
}
