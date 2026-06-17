import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "DrivoraParts",
  description: "Premium Auto Parts Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}