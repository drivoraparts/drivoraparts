import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { buildSitemapEntries } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(getSiteUrl());
}
