/**
 * SEO smoke test — runs in CI after build and on deploy.
 * Validates sitemap, robots, canonical tags, and meta descriptions on live site.
 */
const SITE = process.env.SEO_SITE_URL ?? "https://drivoraparts.com";

const checks = [];

function pass(name, detail = "") {
  checks.push({ ok: true, name, detail });
}

function fail(name, detail = "") {
  checks.push({ ok: false, name, detail });
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { res, text };
}

function extractCanonical(html) {
  return html.match(/rel="canonical" href="([^"]+)"/i)?.[1] ?? null;
}

function extractMetaDescription(html) {
  return html.match(/name="description" content="([^"]+)"/i)?.[1] ?? null;
}

function extractTitle(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null;
}

function extractProductOfferJsonLd(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
    (m) => m[1]
  );
  for (const raw of scripts) {
    try {
      const data = JSON.parse(raw);
      if (data["@type"] === "Product" && data.offers) return data.offers;
    } catch {
      // ignore malformed blocks
    }
  }
  return null;
}

function hasMerchantOfferFields(offers) {
  if (!offers || typeof offers !== "object") return false;
  const shipping = offers.shippingDetails;
  const returns = offers.hasMerchantReturnPolicy;
  const hasShipping = Array.isArray(shipping)
    ? shipping.length > 0 && shipping.every((entry) => entry?.["@type"] === "OfferShippingDetails")
    : shipping?.["@type"] === "OfferShippingDetails";
  const hasReturns = Array.isArray(returns)
    ? returns.length > 0 && returns.every((entry) => entry?.["@type"] === "MerchantReturnPolicy")
    : returns?.["@type"] === "MerchantReturnPolicy";
  return Boolean(hasShipping && hasReturns);
}

try {
  const { res: sitemapRes, text: sitemapXml } = await fetchText(`${SITE}/sitemap.xml`);
  if (!sitemapRes.ok) fail("sitemap.xml reachable", `HTTP ${sitemapRes.status}`);
  else {
    const urlCount = (sitemapXml.match(/<loc>/g) ?? []).length;
    if (urlCount < 100) fail("sitemap url count", `${urlCount} URLs (expected 100+)`);
    else pass("sitemap.xml", `${urlCount} URLs`);
  }

  const { res: robotsRes, text: robotsTxt } = await fetchText(`${SITE}/robots.txt`);
  if (!robotsRes.ok) fail("robots.txt reachable", `HTTP ${robotsRes.status}`);
  else if (!robotsTxt.includes("Sitemap:")) fail("robots.txt sitemap directive");
  else pass("robots.txt", "includes Sitemap directive");

  const pages = [
    { path: "/", expectCanonical: `${SITE.replace(/\/$/, "")}` },
    { path: "/catalog/suspension", keyword: "lift" },
    { path: "/catalog/all", keyword: "Products" },
  ];

  for (const page of pages) {
    const url = `${SITE}${page.path}`;
    const { res, text } = await fetchText(url);
    if (!res.ok) {
      fail(`${page.path} HTTP`, String(res.status));
      continue;
    }

    const canonical = extractCanonical(text);
    const description = extractMetaDescription(text);
    const title = extractTitle(text);

    if (page.expectCanonical && canonical && !canonical.startsWith(page.expectCanonical)) {
      fail(`${page.path} canonical`, canonical);
    } else if (canonical) {
      pass(`${page.path} canonical`, canonical);
    } else {
      fail(`${page.path} canonical`, "missing");
    }

    if (!description || description.length < 50) {
      fail(`${page.path} description`, description ?? "missing");
    } else {
      pass(`${page.path} description`, `${description.length} chars`);
    }

    if (!title) fail(`${page.path} title`, "missing");
    else pass(`${page.path} title`, title.slice(0, 60));

    if (page.keyword && !text.toLowerCase().includes(page.keyword.toLowerCase())) {
      fail(`${page.path} content`, `missing keyword "${page.keyword}"`);
    }
  }

  for (const blocked of ["/cart", "/checkout"]) {
    const { text } = await fetchText(`${SITE}${blocked}`);
    if (/noindex/i.test(text)) pass(`${blocked} noindex`);
    else fail(`${blocked} noindex`, "should not be indexed");
  }

  const { res: productRes, text: productHtml } = await fetchText(`${SITE}/product/1845`);
  if (!productRes.ok) {
    fail("/product/1845 HTTP", String(productRes.status));
  } else {
    const offers = extractProductOfferJsonLd(productHtml);
    if (hasMerchantOfferFields(offers)) {
      pass("product merchant JSON-LD", "shippingDetails + hasMerchantReturnPolicy");
    } else {
      fail(
        "product merchant JSON-LD",
        "Product offers must include OfferShippingDetails and MerchantReturnPolicy"
      );
    }
  }
} catch (error) {
  fail("network", error instanceof Error ? error.message : String(error));
}

const failed = checks.filter((c) => !c.ok);
for (const check of checks) {
  const mark = check.ok ? "✓" : "✗";
  console.log(`${mark} ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
}

if (failed.length) {
  console.error(`\n${failed.length} SEO check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} SEO checks passed.`);
