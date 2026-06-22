import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import StoreProviders from "./providers";
import LayoutShell from "@/components/layout/LayoutShell";
import { getSiteUrl } from "@/lib/env";

/**
 * Cloudflare OpenNext uses Node.js on Workers (see wrangler.jsonc nodejs_compat).
 * Per-route edge runtime exports break OpenNext — see docs/CLOUDFLARE-DEPLOY.md.
 */

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DrivoraParts | Automotive Performance Marketplace",
    template: "%s | DrivoraParts",
  },
  description:
    "Buy performance engines, turbo systems, and aftermarket parts from a trusted automotive marketplace.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "DrivoraParts",
    title: "DrivoraParts",
    description: "Automotive Performance Marketplace",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const isAdmin = headerStore.get("x-is-admin") === "1";

  return (
    <html lang="en">
      <body>
        {isAdmin ? (
          children
        ) : (
          <StoreProviders>
            <LayoutShell>{children}</LayoutShell>
          </StoreProviders>
        )}
      </body>
    </html>
  );
}
