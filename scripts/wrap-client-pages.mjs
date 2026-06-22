import fs from "fs";
import path from "path";

const clientPages = [
  ["app/page.tsx", "app/HomePageClient.tsx", "HomePageClient"],
  ["app/home/page.tsx", "app/home/HomeMarketPageClient.tsx", "HomeMarketPageClient"],
  ["app/cart/page.tsx", "app/cart/CartPageClient.tsx", "CartPageClient"],
  ["app/checkout/page.tsx", "app/checkout/CheckoutPageClient.tsx", "CheckoutPageClient"],
  ["app/admin/ads/page.tsx", "app/admin/ads/AdminAdsPageClient.tsx", "AdminAdsPageClient"],
];

for (const [pagePath, clientPath, clientName] of clientPages) {
  const src = fs.readFileSync(pagePath, "utf8");
  if (!src.trimStart().startsWith('"use client"') && !src.trimStart().startsWith("'use client'")) {
    console.log("skip (not client):", pagePath);
    continue;
  }

  fs.writeFileSync(clientPath, src);
  fs.writeFileSync(
    pagePath,
    `export const runtime = 'edge';\n\nimport ${clientName} from "./${path.basename(clientPath, ".tsx")}";\n\nexport default ${clientName};\n`
  );
  console.log("wrapped:", pagePath);
}
