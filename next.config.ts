import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/aftermarket",
        destination: "/catalog/aftermarket",
        permanent: true,
      },
      // 1513 and 1517 were the same 2011-2016 Superduty 8ft bed, published
      // twice by the source site under two slugs. 1513 was withdrawn and
      // merged into 1517, so its URL is kept alive rather than left to 404.
      // DrivoraParts ships only within the United States. The Australia, UK
      // and Worldwide catalog views were retired with international
      // shipping; their URLs land on the full catalog rather than 404.
      { source: "/catalog/australia", destination: "/catalog/all", permanent: true },
      { source: "/catalog/uk", destination: "/catalog/all", permanent: true },
      { source: "/catalog/worldwide", destination: "/catalog/all", permanent: true },
      // An article about cross-border buying, withdrawn with international shipping.
      { source: "/news/cross-border-automotive-parts-sourcing", destination: "/news", permanent: true },
      {
        source: "/product/1513",
        destination: "/product/1517",
        permanent: true,
      },
    ];
  },
  async headers() {
    const staticAssetCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];

    return [
      {
        source: "/catalog/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // Must come after the rule above so it wins for this one path. Scoped
      // by path rather than `has: [{ type: "query", key: "q" }]` because the
      // Cloudflare adapter doesn't honour `has`, so a query-conditional rule
      // silently applied to every /catalog/* URL and left the category hubs
      // uncached too. Search only ever runs on /catalog/all, and that page is
      // force-dynamic anyway, so keeping just it uncached costs nothing while
      // the hubs keep their full 1h edge cache.
      {
        source: "/catalog/all",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/product/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/product-media/:path*",
        headers: staticAssetCache,
      },
      {
        source: "/api/media/remote",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/home/:path*",
        headers: staticAssetCache,
      },
    ];
  },
};

export default nextConfig;
