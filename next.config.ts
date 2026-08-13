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
