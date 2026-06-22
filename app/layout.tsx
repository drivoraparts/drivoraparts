import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "@/components/layout/LayoutShell";
import { getSiteUrl } from "@/lib/env";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
