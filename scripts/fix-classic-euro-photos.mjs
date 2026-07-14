/**
 * Replace classic-euro placeholder catalog cards with real product photos.
 * Run: node scripts/fix-classic-euro-photos.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MEDIA = path.join(ROOT, "public/product-media");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function downloadMany(urls, dir, max = 6) {
  await fs.mkdir(dir, { recursive: true });
  // clear old placeholders
  for (const f of await fs.readdir(dir)) {
    if (/^\d+\.(jpe?g|png|webp)$/i.test(f)) {
      await fs.unlink(path.join(dir, f));
    }
  }
  let n = 0;
  for (const url of urls) {
    if (n >= max) break;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "image/*,*/*" },
        redirect: "follow",
      });
      if (!res.ok) {
        console.log("  skip", res.status, url.slice(0, 90));
        continue;
      }
      let buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2500) continue;
      buf = await sharp(buf)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 88 })
        .toBuffer();
      n += 1;
      const out = path.join(dir, `${n}.jpg`);
      await fs.writeFile(out, buf);
      console.log("  saved", `${n}.jpg`, buf.length);
    } catch (e) {
      console.log("  err", e.message?.slice(0, 80), url.slice(0, 80));
    }
  }
  if (n < 1) throw new Error(`no images for ${dir}`);
  return n;
}

async function shopifyImages(productJsonUrl) {
  const res = await fetch(productJsonUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${productJsonUrl}`);
  const p = (await res.json()).product;
  console.log("Shopify:", p.title);
  return (p.images || []).map((i) => i.src);
}

async function extractHtmlImages(pageUrl, filterRe) {
  const res = await fetch(pageUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${pageUrl}`);
  const html = await res.text();
  const urls = [
    ...html.matchAll(
      /(?:src|data-src|content)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi
    ),
  ].map((m) => m[1].replace(/&amp;/g, "&"));
  const uniq = [...new Set(urls)].filter((u) => filterRe.test(u));
  console.log("HTML images", pageUrl.slice(0, 70), uniq.length);
  return uniq;
}

const jobs = [];

// --- Caddy Maxi roof rack (Front Runner via Overland Kings) ---
jobs.push(async () => {
  console.log("\nCaddy roof rack");
  const imgs = await shopifyImages(
    "https://overlandkings.com/products/ovk-krvc006t.json"
  );
  await downloadMany(
    imgs,
    path.join(MEDIA, "roof-racks/vw-caddy-maxi-aluminium-roof-rack")
  );
});

// --- Caddy side steps / running boards ---
jobs.push(async () => {
  console.log("\nCaddy side steps");
  const candidates = [
    "https://dms-engineering.com.au/products/volkswagen-caddy-maxi-2005-2020-aluminum-roof-racks.json",
    "https://roofrack.co.uk/products/ulti-rack-aluminium-roof-rack-volkswagen-caddy-2021-present.json",
  ];
  // Prefer dedicated side-step products if found via search
  let imgs = [];
  for (const host of [
    "www.vanstyle.co.uk",
    "www.autostyling.co.uk",
    "www.t5campervanstore.co.uk",
    "www.campervanstore.co.uk",
  ]) {
    try {
      const res = await fetch(
        `https://${host}/search/suggest.json?q=${encodeURIComponent(
          "caddy side steps"
        )}&resources[type]=product&resources[limit]=8`,
        { headers: { "User-Agent": UA } }
      );
      if (!res.ok) continue;
      const j = await res.json();
      const products = j?.resources?.results?.products || [];
      for (const p of products) {
        console.log("  hit", host, p.handle, p.title?.slice?.(0, 60));
        if (/side.?step|running.?board|sidestep/i.test(p.title || "")) {
          imgs = await shopifyImages(
            `https://${host}/products/${p.handle}.json`
          );
          break;
        }
      }
      if (imgs.length) break;
    } catch {
      /* next */
    }
  }
  if (!imgs.length) {
    // fallback: commercial van step images from a known Shopify listing
    try {
      imgs = await shopifyImages(
        "https://www.vanpimps.com/products.json?limit=50"
      );
    } catch {
      /* ignore */
    }
  }
  // Last resort: use roof rack extras are wrong — try Front Runner / generic steps
  if (!imgs.length) {
    imgs = await extractHtmlImages(
      "https://www.ebay.com/sch/i.html?_nkw=vw+caddy+maxi+side+steps",
      /i\.ebayimg\.com|shopify/i
    );
  }
  if (!imgs.length) throw new Error("no side step images");
  await downloadMany(
    imgs,
    path.join(MEDIA, "bodyparts/vw-caddy-maxi-side-steps")
  );
});

// --- Caddy load liner ---
jobs.push(async () => {
  console.log("\nCaddy load liner");
  let imgs = [];
  for (const host of [
    "www.vanstyle.co.uk",
    "www.autostyling.co.uk",
    "www.t5campervanstore.co.uk",
  ]) {
    try {
      const res = await fetch(
        `https://${host}/search/suggest.json?q=${encodeURIComponent(
          "caddy load liner"
        )}&resources[type]=product&resources[limit]=8`,
        { headers: { "User-Agent": UA } }
      );
      if (!res.ok) continue;
      const j = await res.json();
      const products = j?.resources?.results?.products || [];
      for (const p of products) {
        console.log("  hit", host, p.handle, p.title?.slice?.(0, 60));
        if (/liner|mat|cargo|load/i.test(p.title || "")) {
          imgs = await shopifyImages(
            `https://${host}/products/${p.handle}.json`
          );
          break;
        }
      }
      if (imgs.length) break;
    } catch {
      /* next */
    }
  }
  if (!imgs.length) {
    imgs = await extractHtmlImages(
      "https://www.ebay.com/sch/i.html?_nkw=vw+caddy+maxi+load+liner",
      /i\.ebayimg\.com/i
    );
  }
  await downloadMany(
    imgs,
    path.join(MEDIA, "interior/vw-caddy-maxi-load-liner")
  );
});

// --- BMW 1972 AT ---
jobs.push(async () => {
  console.log("\nBMW 1972 AT");
  let imgs = await extractHtmlImages(
    "https://www.bavaria-car-parts.de/bmw-2002-automatikgetriebe-getriebe-automatik-18499.html",
    /bavaria-car-parts|media|product|cdn|jpg|jpeg|webp|png/i
  );
  if (imgs.length < 1) {
    imgs = [
      "https://www.bmw-spare-parts.com/thumbs/bmw/moto_img_new/1/800_800/Automatic-transmission-bmw-cars-18934.webp",
      "https://www.bmw-spare-parts.com/thumbs/bmw/moto_img_new/2/800_800/28754.webp",
    ];
  }
  await downloadMany(
    imgs,
    path.join(MEDIA, "transmission/bmw-1972-automatic-transmission")
  );
});

// --- Behr A/C ---
jobs.push(async () => {
  console.log("\nBehr AC");
  let imgs = await extractHtmlImages(
    "https://www.ebay.com/sch/i.html?_nkw=bmw+2002+behr+air+conditioning+compressor",
    /i\.ebayimg\.com/i
  );
  if (imgs.length < 1) {
    imgs = await extractHtmlImages(
      "https://www.ebay.com/sch/i.html?_nkw=behr+ac+compressor+bmw+02",
      /i\.ebayimg\.com/i
    );
  }
  await downloadMany(
    imgs,
    path.join(MEDIA, "aftermarket/bmw-behr-original-ac-system")
  );
});

// --- Window seals ---
jobs.push(async () => {
  console.log("\nWindow seals");
  let imgs = await extractHtmlImages(
    "https://www.ebay.com/sch/i.html?_nkw=bmw+2002+window+seal+rubber+front+rear",
    /i\.ebayimg\.com/i
  );
  await downloadMany(
    imgs,
    path.join(MEDIA, "bodyparts/bmw-2000-nk-window-seals")
  );
});

// --- Chrome trims ---
jobs.push(async () => {
  console.log("\nChrome trims");
  let imgs = await extractHtmlImages(
    "https://www.ebay.com/sch/i.html?_nkw=bmw+2000+neue+klasse+chrome+trim+molding",
    /i\.ebayimg\.com/i
  );
  if (imgs.length < 1) {
    imgs = await extractHtmlImages(
      "https://www.ebay.com/sch/i.html?_nkw=bmw+2002+chrome+trim+set",
      /i\.ebayimg\.com/i
    );
  }
  await downloadMany(
    imgs,
    path.join(MEDIA, "bodyparts/bmw-2000-1967-chrome-trims")
  );
});

for (const job of jobs) {
  try {
    await job();
  } catch (e) {
    console.error("JOB FAIL", e.message);
  }
}

console.log("\nDone");
