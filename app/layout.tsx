import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";
import { MarketProvider } from "@/components/context/MarketContext";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body className="bg-black text-white">

        <MarketProvider>
          <LayoutShell>{children}</LayoutShell>
        </MarketProvider>

      </body>
    </html>
  );
}