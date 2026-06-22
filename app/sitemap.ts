import type { MetadataRoute } from "next";
import { getAllProducts, routes } from "@/lib/inventory";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const products = getAllProducts();
  const now = new Date();

  const staticRoutes = [
    "",
    "/home",
    "/catalog",
    "/catalog/all",
    "/aftermarket",
    "/about",
    "/contact",
    "/cart",
    "/policies",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}${routes.product(product.id)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
