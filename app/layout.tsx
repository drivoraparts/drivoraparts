import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Archivo } from "next/font/google";
import "./globals.css";
import StoreProviders from "./providers";
import LayoutShell from "@/components/layout/LayoutShell";
import { getSiteUrl, getGoogleSiteVerification } from "@/lib/env";
import {
  DEFAULT_DESCRIPTION,
  ICON_VERSION,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteImageUrl,
  defaultSiteSocialImages,
  organizationJsonLd,
  websiteJsonLd,
  SITE_KEYWORDS,
} from "@/lib/seo";
import {
  detectCurrencyFromAcceptLanguage,
  detectCurrencyFromCountry,
} from "@/lib/currency/detect";
import { detectLanguageFromAcceptLanguage } from "@/lib/i18n";
import JsonLdScript from "@/components/seo/JsonLdScript";
import MetaPixel from "@/components/analytics/MetaPixel";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import GoogleTagManagerNoScript from "@/components/analytics/GoogleTagManagerNoScript";
import TikTokPixel from "@/components/analytics/TikTokPixel";
import TikTokPageTracker from "@/components/analytics/TikTokPageTracker";
import { getGaMeasurementId, getGtmContainerId, getMetaPixelId, getTikTokPixelId } from "@/lib/env";

/**
 * Cloudflare OpenNext uses Node.js on Workers (see wrangler.jsonc nodejs_compat).
 * Per-route edge runtime exports break OpenNext — see docs/CLOUDFLARE-DEPLOY.md.
 */

const siteUrl = getSiteUrl();

/*
 * The site rendered in Arial until now: globals.css hard-set it on <body>,
 * and --font-geist-sans was referenced by the Tailwind theme but never
 * actually defined anywhere. Nothing reads less premium than the browser
 * default font on a brand page.
 *
 * Archivo is a grotesque with sturdy, slightly squared forms -- close in
 * character to the industrial sans ARB and similar 4x4 brands license, and
 * it carries weight well at the display sizes the hero uses. Self-hosted by
 * next/font at build time, so there is no runtime request to Google and no
 * layout shift while a webfont loads.
 */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  axes: ["wdth"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DrivoraParts | Automotive Performance Marketplace",
    template: "%s | DrivoraParts",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: defaultSiteSocialImages(),
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: [absoluteImageUrl()],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: `/site.webmanifest?v=${ICON_VERSION}`,
  icons: {
    icon: [
      {
        url: `/favicon.ico?v=${ICON_VERSION}`,
        sizes: "any",
      },
      {
        url: `/favicon-32.png?v=${ICON_VERSION}`,
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: `/favicon-16.png?v=${ICON_VERSION}`,
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: `/favicon.png?v=${ICON_VERSION}`,
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: `/apple-touch-icon.png?v=${ICON_VERSION}`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: `/favicon.ico?v=${ICON_VERSION}`,
  },
  appleWebApp: {
    title: "DrivoraParts",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  ...(getGoogleSiteVerification()
    ? { verification: { google: getGoogleSiteVerification()! } }
    : {}),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const isAdmin = headerStore.get("x-is-admin") === "1";
  const acceptLanguage = headerStore.get("accept-language");
  const initialLocale =
    acceptLanguage?.split(",")[0]?.split(";")[0]?.trim() || "en-US";
  // Where the buyer actually is beats what their browser asks for: an expat
  // running an en-US browser in Sydney should still see AUD. CF-IPCountry is
  // set by Cloudflare in front of the Worker; Accept-Language covers local dev
  // and anything that reaches us without it.
  const initialCurrency =
    detectCurrencyFromCountry(headerStore.get("cf-ipcountry")) ??
    detectCurrencyFromAcceptLanguage(acceptLanguage);
  const initialLanguage = detectLanguageFromAcceptLanguage(acceptLanguage);
  const metaPixelId = getMetaPixelId();
  const tikTokPixelId = getTikTokPixelId();
  const gaMeasurementId = getGaMeasurementId();
  const gtmContainerId = getGtmContainerId();

  return (
    <html lang={initialLanguage} className={archivo.variable} suppressHydrationWarning>
      <body>
        {/* GTM noscript fallback must be the first element after <body>
            opens per Google's install instructions. */}
        {!isAdmin && <GoogleTagManagerNoScript containerId={gtmContainerId} />}
        <JsonLdScript data={[organizationJsonLd(), websiteJsonLd()]} />
        {isAdmin ? (
          children
        ) : (
          <>
            <GoogleTagManager containerId={gtmContainerId} />
            <MetaPixel pixelId={metaPixelId} />
            <TikTokPixel pixelId={tikTokPixelId} />
            <GoogleAnalytics measurementId={gaMeasurementId} />
            <TikTokPageTracker />
            <StoreProviders
              initialCurrency={initialCurrency}
              initialLocale={initialLocale}
              initialLanguage={initialLanguage}
            >
              <LayoutShell>{children}</LayoutShell>
            </StoreProviders>
          </>
        )}
      </body>
    </html>
  );
}
