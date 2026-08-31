import type { MetadataRoute } from "next";
import { engineTree, getPlatformSlug } from "@/data/engine";
import { vehiclePlatforms } from "@/data/vehicles";
import {
  brands,
  categories,
  getAllProducts,
  routes,
} from "@/lib/inventory";
import { POLICY_PATHS } from "./constants";
import { hasGenericPlaceholderDescription } from "./product-seo";

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  priority: number,
  changeFrequency: SitemapEntry["changeFrequency"] = "weekly",
  lastModified?: Date
): SitemapEntry {
  return {
    url: path,
    lastModified: lastModified ?? new Date(),
    changeFrequency,
    priority,
  };
}

/** All indexable storefront URLs — grows automatically with catalog data. */
export function buildSitemapEntries(siteUrl: string): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");
  const toUrl = (path: string) => `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const products = getAllProducts();

  const staticPaths = [
    { path: "", priority: 1 },
    { path: routes.catalog, priority: 0.95 },
    { path: routes.all, priority: 0.9 },
    { path: "/vehicles", priority: 0.9 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/policies", priority: 0.4 },
  ];

  // /catalog/engine is already included here via the generic category loop
  // (same priority, 0.9) -- it used to also be hardcoded in staticPaths
  // above, which submitted it to Google twice in the same sitemap.
  const categoryEntries = categories.map((category) =>
    entry(toUrl(routes.category(category.slug)), 0.9)
  );

  // Skip brand-category combos with zero products — those pages 404 (see
  // app/catalog/[category]/[brand]/page.tsx) and shouldn't be submitted for indexing.
  // Also skip category "engine" — its brand entries are never reachable via
  // this route (see the matching note in that page's generateStaticParams);
  // engine is covered by enginePlatformEntries below instead.
  const brandEntries = brands
    .filter(
      (brand) =>
        brand.category !== "engine" &&
        products.some((p) => p.category === brand.category && p.brand === brand.slug)
    )
    .map((brand) => entry(toUrl(routes.brand(brand.category, brand.slug)), 0.85));

  const vehicleEntries = vehiclePlatforms.map((platform) =>
    entry(toUrl(`/vehicles/${platform.slug}`), 0.85)
  );

  const enginePlatformEntries = engineTree.flatMap((group) =>
    group.platforms.map((platform) =>
      entry(toUrl(`/catalog/engine/${getPlatformSlug(platform)}`), 0.85)
    )
  );

  // Bulk-imported listings still on the generic placeholder description are
  // noindexed on the page itself (see hasGenericPlaceholderDescription) — keep
  // them out of the sitemap too so we're not asking Google to crawl and index
  // pages the site marks noindex.
  const productEntries = products
    .filter((product) => !hasGenericPlaceholderDescription(product.description))
    .map((product) =>
      entry(
        toUrl(routes.product(product.id)),
        0.8,
        "weekly",
        product.createdAt ? new Date(product.createdAt) : undefined
      )
    );

  const policyEntries = POLICY_PATHS.map((path) =>
    entry(toUrl(path), 0.3, "monthly")
  );

  return [
    ...staticPaths.map(({ path, priority }) => entry(toUrl(path), priority)),
    ...categoryEntries,
    ...brandEntries,
    // Omitting these was a silent regression: vehicleEntries was built above
    // but never spread in, so the ten vehicle hubs were absent from the
    // sitemap while the /vehicles index was present. Nothing errors on an
    // unused local, so the build stayed green and Google was never told the
    // pages existed.
    ...vehicleEntries,
    ...enginePlatformEntries,
    ...productEntries,
    ...policyEntries,
  ];
}
