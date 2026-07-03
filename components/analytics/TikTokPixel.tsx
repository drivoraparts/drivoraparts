import Script from "next/script";

import { buildTikTokBaseScript } from "@/lib/analytics/tiktok-base-script";

type Props = {
  pixelId: string;
};

/** TikTok base pixel — afterInteractive so mobile Safari is not blocked on first paint. */
export default function TikTokPixel({ pixelId }: Props) {
  const id = pixelId.trim();
  if (!id) return null;

  return (
    <Script id="tiktok-pixel-base" strategy="lazyOnload">
      {buildTikTokBaseScript(id)}
    </Script>
  );
}
