import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Archivo } from "next/font/google";
import "./globals.css";
import StoreProviders from "./providers";
import LayoutShell from "@/components/layout/LayoutShell";
import { hasGenuineSection } from "@/lib/catalog/toyota-departments";
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
    default: "DrivoraParts | Toyota Parts",
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
  /*
   * The storefront serves the United States: prices in USD, American English,
   * whatever the visitor's browser or location. These used to follow
   * CF-IPCountry and Accept-Language, which priced the catalog in AUD or EUR
   * for overseas visitors -- wrong for a US-focused Toyota parts store, whose
   * checkout and shipping table are both in dollars.
   */
  const initialLocale = "en-US";
  const initialCurrency = "USD";
  const initialLanguage = "en";
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
              <LayoutShell showGenuine={hasGenuineSection()}>{children}</LayoutShell>
            </StoreProviders>
          </>
        )}
      </body>
    </html>
  );
}
