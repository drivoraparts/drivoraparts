import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import StoreProviders from "./providers";
import LayoutShell from "@/components/layout/LayoutShell";
import { getSiteUrl, getGoogleSiteVerification } from "@/lib/env";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";
import {
  detectCurrencyFromAcceptLanguage,
} from "@/lib/currency";
import { detectLanguageFromAcceptLanguage } from "@/lib/i18n";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

/**
 * Cloudflare OpenNext uses Node.js on Workers (see wrangler.jsonc nodejs_compat).
 * Per-route edge runtime exports break OpenNext — see docs/CLOUDFLARE-DEPLOY.md.
 */

const siteUrl = getSiteUrl();

const ICON_VERSION = "7";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DrivoraParts | Automotive Performance Marketplace",
    template: "%s | DrivoraParts",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_TAGLINE,
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
  const initialCurrency = detectCurrencyFromAcceptLanguage(acceptLanguage);
  const initialLanguage = detectLanguageFromAcceptLanguage(acceptLanguage);

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body>
        <JsonLdScript data={[organizationJsonLd(), websiteJsonLd()]} />
        {isAdmin ? (
          children
        ) : (
          <StoreProviders
            initialCurrency={initialCurrency}
            initialLocale={initialLocale}
            initialLanguage={initialLanguage}
          >
            <LayoutShell>{children}</LayoutShell>
          </StoreProviders>
        )}
      </body>
    </html>
  );
}
