import fs from "fs";
import path from "path";

const pairs = [
  ["app/page.tsx", "app/HomePageClient.tsx"],
  ["app/home/page.tsx", "app/home/HomeMarketPageClient.tsx"],
  ["app/cart/page.tsx", "app/cart/CartPageClient.tsx"],
  ["app/checkout/page.tsx", "app/checkout/CheckoutPageClient.tsx"],
  ["app/admin/ads/page.tsx", "app/admin/ads/AdminAdsPageClient.tsx"],
];

for (const [pagePath, clientPath] of pairs) {
  if (!fs.existsSync(clientPath)) {
    console.log("skip missing:", clientPath);
    continue;
  }

  const clientSrc = fs.readFileSync(clientPath, "utf8");
  fs.writeFileSync(pagePath, clientSrc);
  fs.unlinkSync(clientPath);
  console.log("unwrapped:", pagePath);
}
