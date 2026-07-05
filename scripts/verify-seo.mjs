/**
 * SEO smoke test — runs in CI after build and on deploy.
 * Validates sitemap, robots, canonical tags, and meta descriptions on live site.
 * Retries after deploy because Cloudflare can serve cached HTML for ~30–60s.
 */
const SITE = process.env.SEO_SITE_URL ?? "https://drivoraparts.com";
const MAX_ATTEMPTS = Number(process.env.SEO_VERIFY_RETRIES ?? 8);
const RETRY_DELAY_MS = Number(process.env.SEO_VERIFY_DELAY_MS ?? 20000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pass(checks, name, detail = "") {
  checks.push({ ok: true, name, detail });
}

function fail(checks, name, detail = "") {
  checks.push({ ok: false, name, detail });
}

function cacheBustUrl(path) {
  const base = path.startsWith("http") ? path : `${SITE}${path}`;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}_seo_verify=${Date.now()}`;
}

async function fetchText(path) {
  const transient = new Set([502, 503, 504]);
  let lastError = null;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(cacheBustUrl(path), {
        redirect: "follow",
        headers: {
          "cache-control": "no-cache",
          pragma: "no-cache",
        },
      });

      if (transient.has(res.status) && attempt < 4) {
        await sleep(2000 * attempt);
        continue;
      }

      const text = await res.text();
      return { res, text };
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        await sleep(2000 * attempt);
        continue;
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${path}`);
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

async function runChecks() {
  const checks = [];

  try {
    const { res: sitemapRes, text: sitemapXml } = await fetchText("/sitemap.xml");
    if (!sitemapRes.ok) fail(checks, "sitemap.xml reachable", `HTTP ${sitemapRes.status}`);
    else {
      const urlCount = (sitemapXml.match(/<loc>/g) ?? []).length;
      if (urlCount < 100) fail(checks, "sitemap url count", `${urlCount} URLs (expected 100+)`);
      else pass(checks, "sitemap.xml", `${urlCount} URLs`);
    }

    const { res: robotsRes, text: robotsTxt } = await fetchText("/robots.txt");
    if (!robotsRes.ok) fail(checks, "robots.txt reachable", `HTTP ${robotsRes.status}`);
    else if (!robotsTxt.includes("Sitemap:")) fail(checks, "robots.txt sitemap directive");
    else pass(checks, "robots.txt", "includes Sitemap directive");

    const pages = [
      { path: "/", expectCanonical: `${SITE.replace(/\/$/, "")}` },
      { path: "/catalog/suspension", keyword: "lift" },
      { path: "/catalog/all", keyword: "Products" },
    ];

    for (const page of pages) {
      const { res, text } = await fetchText(page.path);
      if (!res.ok) {
        fail(checks, `${page.path} HTTP`, String(res.status));
        continue;
      }

      const canonical = extractCanonical(text);
      const description = extractMetaDescription(text);
      const title = extractTitle(text);

      if (page.expectCanonical && canonical && !canonical.startsWith(page.expectCanonical)) {
        fail(checks, `${page.path} canonical`, canonical);
      } else if (canonical) {
        pass(checks, `${page.path} canonical`, canonical);
      } else {
        fail(checks, `${page.path} canonical`, "missing");
      }

      if (!description || description.length < 50) {
        fail(checks, `${page.path} description`, description ?? "missing");
      } else {
        pass(checks, `${page.path} description`, `${description.length} chars`);
      }

      if (!title) fail(checks, `${page.path} title`, "missing");
      else pass(checks, `${page.path} title`, title.slice(0, 60));

      if (page.keyword && !text.toLowerCase().includes(page.keyword.toLowerCase())) {
        fail(checks, `${page.path} content`, `missing keyword "${page.keyword}"`);
      }
    }

    for (const blocked of ["/cart", "/checkout"]) {
      const { text } = await fetchText(blocked);
      if (/noindex/i.test(text)) pass(checks, `${blocked} noindex`);
      else fail(checks, `${blocked} noindex`, "should not be indexed");
    }

    const { res: productRes, text: productHtml } = await fetchText("/product/1845");
    if (!productRes.ok) {
      fail(checks, "/product/1845 HTTP", String(productRes.status));
    } else {
      const offers = extractProductOfferJsonLd(productHtml);
      if (hasMerchantOfferFields(offers)) {
        pass(checks, "product merchant JSON-LD", "shippingDetails + hasMerchantReturnPolicy");
      } else {
        fail(
          checks,
          "product merchant JSON-LD",
          "Product offers must include OfferShippingDetails and MerchantReturnPolicy"
        );
      }
    }
  } catch (error) {
    fail(checks, "network", error instanceof Error ? error.message : String(error));
  }

  return checks;
}

function printChecks(checks) {
  for (const check of checks) {
    const mark = check.ok ? "✓" : "✗";
    console.log(`${mark} ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
  }
}

let lastChecks = [];

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  if (attempt > 1) {
    console.log(`\nRetrying SEO checks in ${RETRY_DELAY_MS / 1000}s (attempt ${attempt}/${MAX_ATTEMPTS})…`);
    await sleep(RETRY_DELAY_MS);
  } else {
    console.log(`Running SEO checks against ${SITE}…`);
  }

  lastChecks = await runChecks();
  const failed = lastChecks.filter((check) => !check.ok);

  if (failed.length === 0) {
    printChecks(lastChecks);
    console.log(`\nAll ${lastChecks.length} SEO checks passed on attempt ${attempt}.`);
    process.exit(0);
  }

  console.log(`Attempt ${attempt} failed (${failed.length} check(s)):`);
  for (const check of failed) {
    console.log(`  ✗ ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
  }
}

printChecks(lastChecks);
console.error(
  `\n${lastChecks.filter((check) => !check.ok).length} SEO check(s) failed after ${MAX_ATTEMPTS} attempt(s).`
);
process.exit(1);
