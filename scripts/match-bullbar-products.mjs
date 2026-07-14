import { BULL_BAR_CATALOG } from "./bull-bar-catalog.mjs";

const STORES = [
  { name: "offroad-developments", base: "https://offroad-developments.com" },
  { name: "ironman4x4", base: "https://www.ironman4x4.com.au" },
];

async function loadStore(base) {
  const all = [];
  for (let page = 1; page <= 6; page++) {
    const res = await fetch(`${base}/products.json?limit=250&page=${page}`, {
      headers: { "User-Agent": "DrivoraParts-Import/1.0" },
    });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.products?.length) break;
    all.push(...data.products);
  }
  return all;
}

function scoreProduct(product, entry) {
  const hay = `${product.title} ${product.body_html ?? ""} ${product.vendor ?? ""}`.toLowerCase();
  let score = 0;
  for (const term of entry.matchTerms) {
    if (hay.includes(term.toLowerCase())) score += 2;
  }
  if (entry.brand && hay.includes(entry.brand.toLowerCase())) score += 3;
  if (/bull bar|bullbar|winch bumper|winchbumper/i.test(product.title)) score += 2;
  if (/loom|kit|bracket|cover plate|polish|patch/i.test(product.title)) score -= 5;
  if ((product.images?.length ?? 0) >= 2) score += 1;
  return score;
}

function pickBest(products, entry) {
  return products
    .map((p) => ({ p, score: scoreProduct(p, entry) }))
    .filter((x) => x.score >= entry.minScore ?? 6)
    .sort((a, b) => b.score - a.score)[0]?.p;
}

async function main() {
  const storeData = {};
  for (const store of STORES) {
    console.log(`Loading ${store.name}...`);
    storeData[store.name] = await loadStore(store.base);
    console.log(`  ${storeData[store.name].length} products`);
  }

  for (const entry of BULL_BAR_CATALOG) {
    console.log(`\n=== ${entry.name} ===`);
    for (const store of STORES) {
      const hit = pickBest(storeData[store.name], entry);
      if (hit) {
        console.log(
          store.name,
          hit.handle,
          "|",
          hit.title.slice(0, 70),
          "| imgs:",
          hit.images?.length
        );
      }
    }
  }
}

main();
