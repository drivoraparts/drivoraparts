const urls = [
  "https://edmundstruckparts.com/shop/",
  "https://edmundstruckparts.com/wp-json/wp/v2/product?per_page=5",
  "https://edmundstruckparts.com/product/1999-2006-chevy-silverado-8ft-truck-bed/",
];

for (const url of urls) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    console.log("\n", url, "→", res.status, res.headers.get("content-type"));
    const text = await res.text();
    console.log("  length:", text.length);
    if (url.includes("wp-json")) {
      console.log("  json preview:", text.slice(0, 200));
    } else if (url.includes("shop")) {
      const links = [...text.matchAll(/\/product\/[a-z0-9-]+\/?/gi)];
      console.log("  product path matches:", links.length);
    } else {
      console.log("  has og:title:", /og:title/.test(text));
      console.log("  has price:", /woocommerce-Price-amount|\"price\"/.test(text));
    }
  } catch (error) {
    console.log("\n", url, "→ ERROR", error.message);
  }
}
