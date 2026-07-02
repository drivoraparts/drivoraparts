import Script from "next/script";

import { buildTikTokBaseScript } from "@/lib/analytics/tiktok-base-script";

type Props = {
  pixelId: string;
};

/** TikTok base pixel — beforeInteractive, same lifecycle as Meta pixel. */
export default function TikTokPixel({ pixelId }: Props) {
  const id = pixelId.trim();
  if (!id) return null;

  return (
    <Script id="tiktok-pixel-base" strategy="beforeInteractive">
      {buildTikTokBaseScript(id)}
    </Script>
  );
}
