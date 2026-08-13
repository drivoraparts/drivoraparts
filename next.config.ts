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
      // Must come after the rule above so it wins for search URLs. Search
      // results were inheriting that 1h edge cache + 24h stale-while-
      // revalidate, so a CDN copy rendered by an older build kept being
      // served long after a fix deployed -- and a browser hard-refresh
      // doesn't bypass the CDN's own copy. Only ?q= URLs are affected; the
      // category hubs and the plain feed keep their normal caching.
      {
        source: "/catalog/:path*",
        has: [{ type: "query", key: "q" }],
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
