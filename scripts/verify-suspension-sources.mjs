/** Verify suspension source handles return images */
const UA = "DrivoraParts-Import/1.0";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function shopify(store, handle) {
  await delay(600);
  const r = await fetch(`https://${store}/products/${handle}.json`, {
    headers: { "User-Agent": UA },
  });
  if (!r.ok) return { ok: false, status: r.status, imgs: 0 };
  const p = (await r.json()).product;
  return { ok: true, title: p.title, imgs: (p.images ?? []).length };
}

async function orw(url) {
  await delay(600);
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!r.ok) return { ok: false, status: r.status, imgs: 0 };
  const html = await r.text();
  const imgs = [
    ...new Set(
      [...html.matchAll(/https:\/\/img\d\.offroadwarehouse\.com\/prodimage\/ProductImage\/800\/[^"'\s]+/gi)].map(
        (m) => m[0]
      )
    ),
  ];
  return { ok: true, imgs: imgs.length, sample: imgs[0] };
}

const sources = [
  ["shopify", "ppdperformance.com.au", "toyota-hilux-2015-2022-n80-gun-75mm-front-50mm-rear-suspension-lift-kit-tough-dog-adjustable"],
  ["shopify", "ppdperformance.com.au", "ford-ranger-2022-ra-next-gen-iii-40mm-suspension-lift-kit-tough-dog-foam-cell"],
  ["shopify", "ppdperformance.com.au", "nissan-navara-11-2020-2024-np300-50mm-suspension-lift-kit-tough-dog-foam-cell"],
  ["shopify", "ppdperformance.com.au", "isuzu-dmax-2020-2021-50mm-suspension-lift-kit-tough-dog-foam-cell"],
  ["shopify", "ppdperformance.com.au", "toyota-landcruiser-2012-2024-79-dual-cab-series-50mm-suspension-lift-kit-tough-dog-adjustable"],
  ["shopify", "ppdperformance.com.au", "toyota-hilux-2025-2030-n90-40mm-suspension-lift-kit-bilstein-b6"],
  ["shopify", "ppdperformance.com.au", "ford-f150-2021-2030-2021-onwards-excl-tremor-bilstein-bilstein-5160-remote-reservoir-rear-shock-0-2-lift"],
  ["shopify", "ppdperformance.com.au", "toyota-landcruiser-300-series-2021-2025-fox-performance-elite-series-2-5-coilover-reservoir-shock-adjustable-pair-0-2-inch-lift"],
  ["shopify", "ppdperformance.com.au", "ford-ranger-2022-2026-py-next-gen-fox-2-5-per-series-ifp-1-5-2-5-lift-rear-py-ranger-2022-on-fits-ford-ranger-py-2022-on"],
  ["shopify", "ppdperformance.com.au", "toyota-hilux-2012-2022-gun-front-suspension-lift-kit-50-75mm-fox-2-0"],
  ["shopify", "www.ironman4x4.com.au", "toyota-hilux-n80-2015-2025-suspension-lift-kit-foam-cell-pro-heavy-toy077ckp"],
  ["shopify", "www.ironman4x4.com.au", "suspension-lift-kit-for-ford-ranger-next-gen-2022-foam-cell-pro-heavy"],
  ["shopify", "www.ironman4x4.com.au", "isuzu-d-max-rg-2019-on-nitro-gas-suspension-lift-kit-medium-izx020bng"],
  ["shopify", "www.ironman4x4.com.au", "toyota-landcruiser-prado-150-series-foam-cell-pro-suspension-lift-kit-heavy-toy085ckp"],
  ["shopify", "www.ironman4x4.com.au", "mitsubishi-triton-mv-2024-on-foam-cell-pro-suspension-lift-kit-heavy-mit060ckp"],
  ["orw", "https://www.offroadwarehouse.com/product/b8-6112-suspension-kit-47309975"],
  ["orw", "https://www.offroadwarehouse.com/product/b8-6112-suspension-kit-47310025"],
  ["orw", "https://www.offroadwarehouse.com/product/king-shocks-2024-toyota-tacoma-2-5-front-coilover-25001-408a"],
  ["orw", "https://www.offroadwarehouse.com/product/b8-8100-suspension-kit-47-232886"],
  ["orw", "https://www.offroadwarehouse.com/product/b8-6112-suspension-kit-47-255069"],
  ["orw", "https://www.offroadwarehouse.com/product/b8-6112-suspension-kit-47-229632"],
];

for (const src of sources) {
  const res =
    src[0] === "shopify"
      ? await shopify(src[1], src[2])
      : await orw(src[1]);
  const label = src[0] === "shopify" ? `${src[1]}/${src[2].slice(0, 40)}` : src[1].split("/product/")[1];
  console.log(res.ok ? `${res.imgs} img` : `FAIL ${res.status}`, "|", label);
}
