#!/usr/bin/env node
/**
 * Production crawlability test.
 *
 * Requests real public URLs over plain HTTP the way an external crawler does --
 * no browser, no JavaScript, no warmed session -- and reports what actually came
 * back. Written because every claim about this site's crawlability so far has
 * come from ad-hoc curl runs that were hard to reproduce and easy to argue with.
 *
 *   node scripts/test-production-crawl.mjs
 *   node scripts/test-production-crawl.mjs --origin https://drivoraparts.com
 *   node scripts/test-production-crawl.mjs --sitemap 40   # sample 40 sitemap URLs
 *   node scripts/test-production-crawl.mjs --json report.json
 *
 * Exits non-zero if any required route fails, so it can gate a deploy.
 */

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const ORIGIN = (opt("origin", "https://drivoraparts.com")).replace(/\/$/, "");
const SITEMAP_SAMPLE = Number(opt("sitemap", 25));
const CONCURRENCY = Number(opt("concurrency", 3));
const TIMEOUT_MS = Number(opt("timeout", 45000));
const JSON_OUT = opt("json", "");

// Deliberately plain. The server must not vary content by user agent, so these
// exist to prove that it doesn't, not to find one that works.
const AGENTS = {
  browser:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  bingbot: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  aicrawler: "GPTBot/1.2 (+https://openai.com/gptbot)",
};

/** Routes that must work. A failure here fails the run. */
const REQUIRED = [
  { url: "/", family: "home" },
  { url: "/catalog/all", family: "catalog" },
  { url: "/catalog/all?category=engine", family: "catalog" },
  { url: "/catalog/all?q=75+series", family: "catalog" },
  { url: "/catalog/all?category=engine&sort=price-asc", family: "catalog" },
  { url: "/product/200", family: "product" },
  { url: "/product/2115", family: "product" },
];

/** Edge cases that must degrade gracefully rather than 500 or 200-empty. */
const EDGE_CASES = [
  { url: "/product/99999999", family: "product-missing", expect: 404 },
  { url: "/product/not-a-number", family: "product-missing", expect: 404 },
  { url: "/catalog/all?category=does-not-exist", family: "catalog-invalid", expect: 200 },
  { url: "/catalog/all?sort=nonsense&page=-4", family: "catalog-invalid", expect: 200 },
  { url: "/catalog/all?q=%00%01", family: "catalog-invalid", expect: 200 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path, { agent = AGENTS.aicrawler, cold = false } = {}) {
  const sep = path.includes("?") ? "&" : "?";
  const url = ORIGIN + path + (cold ? `${sep}_crawltest=${Date.now()}${Math.random().toString(36).slice(2, 7)}` : "");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": agent, Accept: "text/html,application/xhtml+xml,*/*" },
    });
    const body = await res.text();
    return {
      ok: true, url, status: res.status, ms: Date.now() - started,
      headers: Object.fromEntries(res.headers.entries()),
      body, bytes: Buffer.byteLength(body), redirected: res.redirected, finalUrl: res.url,
    };
  } catch (err) {
    return { ok: false, url, status: 0, ms: Date.now() - started, error: String(err?.message || err), body: "", bytes: 0, headers: {} };
  } finally {
    clearTimeout(timer);
  }
}

/** Everything we assert about a returned document, in one place. */
function inspect(r, family, expect = 200) {
  const b = r.body || "";
  // A deliberate 404 is the right answer, not a defect: skip the content
  // assertions that only make sense for a page that is supposed to exist.
  const expectedNon200 = expect !== 200 && r.status === expect;
  const productLinks = new Set(b.match(/href="\/product\/\d+"/g) || []).size;
  const findings = [];

  const has = {
    title: /<title>[^<]{3,}<\/title>/.test(b),
    canonical: /<link[^>]+rel="canonical"[^>]+href="[^"]+"/.test(b),
    h1: /<h1[\s>]/.test(b),
    ogTitle: /property="og:title"/.test(b),
    ogImage: /property="og:image"/.test(b),
    productJsonLd: /"@type":"Product"/.test(b),
    price: /"price":\s*"?\d/.test(b),
    availability: /"availability":"https:\/\/schema\.org\//.test(b),
    productImage: /\/product-media\/[^"']+\.(?:webp|jpg|jpeg|png|avif|svg)/i.test(b),
    noindex: /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(b),
    loadingShell: /Loading products|Loading the marketplace/i.test(b),
    zeroOfZero: /Showing\s*(?:<!--[^>]*-->)?\s*0\s*(?:<!--[^>]*-->)?\s*of/i.test(b),
  };

  const canonical = (b.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/) || [])[1] || null;
  const title = (b.match(/<title>([^<]*)<\/title>/) || [])[1] || null;

  if (r.status !== expect) findings.push(`status ${r.status} (expected ${expect})`);
  if (expectedNon200) return { ...has, canonical, title, productLinks, findings };
  if (r.status === 200 && r.bytes < 5000) findings.push(`suspiciously small body (${r.bytes}B) — possible empty shell`);
  if (r.status === 200 && !has.title) findings.push("no <title>");
  if (r.status === 200 && !has.canonical) findings.push("no canonical tag");
  if (has.loadingShell) findings.push('serves a client loading shell ("Loading products…") in initial HTML');
  if (has.zeroOfZero) findings.push('serves "Showing 0 of …" false initial state in initial HTML');

  if (family === "product" && r.status === 200) {
    if (!has.h1) findings.push("no <h1> (product name missing from HTML)");
    if (!has.productJsonLd) findings.push("no Product JSON-LD");
    if (!has.price) findings.push("no price in HTML");
    if (!has.availability) findings.push("no availability in HTML");
    if (!has.productImage) findings.push("no product image URL in HTML");
    if (!has.ogImage) findings.push("no og:image");
  }
  if (family === "catalog" && r.status === 200) {
    if (productLinks === 0) findings.push("no product links in server HTML — content requires JavaScript");
  }
  return { ...has, canonical, title, productLinks, findings };
}

async function pool(items, worker, limit = CONCURRENCY) {
  const out = [];
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await worker(items[idx], idx);
      await sleep(120); // be gentle with production
    }
  });
  await Promise.all(runners);
  return out;
}

const short = (s, n) => (s && s.length > n ? s.slice(0, n) + "…" : s || "");

async function main() {
  console.log(`\nDrivoraParts production crawl test — ${ORIGIN}`);
  console.log(`${new Date().toISOString()}  concurrency=${CONCURRENCY}\n`);

  const results = [];
  const record = (r, family, label, extra = {}) => {
    const ins = inspect(r, family, extra.expect ?? 200);
    results.push({ label, family, url: r.url, status: r.status, ms: r.ms, bytes: r.bytes, error: r.error, headers: r.headers, ins, ...extra });
    return ins;
  };

  // ---- robots.txt -------------------------------------------------------
  console.log("── robots.txt");
  const robots = await get("/robots.txt", { agent: AGENTS.googlebot });
  console.log(`   ${robots.status}  ${robots.bytes}B`);
  const disallow = (robots.body.match(/^Disallow:\s*(\S+)/gim) || []).map((l) => l.split(/:\s*/)[1]);
  console.log(`   disallow: ${disallow.join(" ") || "(none)"}`);
  for (const bad of ["/product", "/catalog", "/"]) {
    if (disallow.includes(bad)) console.log(`   !! blocks public path ${bad}`);
  }

  // ---- sitemap ----------------------------------------------------------
  console.log("\n── sitemap.xml");
  const sm = await get("/sitemap.xml", { agent: AGENTS.googlebot });
  const locs = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`   ${sm.status}  ${sm.bytes}B  ${locs.length} urls`);
  const dupes = locs.length - new Set(locs).size;
  const withQuery = locs.filter((u) => u.includes("?")).length;
  if (dupes) console.log(`   !! ${dupes} duplicate urls`);
  if (withQuery) console.log(`   !! ${withQuery} urls contain query strings`);

  // ---- required routes, cold, across every agent ------------------------
  console.log("\n── required routes (cold request, all user agents)");
  const jobs = [];
  for (const route of REQUIRED) {
    for (const [name, ua] of Object.entries(AGENTS)) {
      jobs.push({ route, agentName: name, ua });
    }
  }
  const reqResults = await pool(jobs, async ({ route, agentName, ua }) => {
    const r = await get(route.url, { agent: ua, cold: true });
    return { r, route, agentName };
  });
  const byRoute = new Map();
  for (const { r, route, agentName } of reqResults) {
    const ins = record(r, route.family, `${route.url} [${agentName}]`, { agent: agentName, required: true });
    if (!byRoute.has(route.url)) byRoute.set(route.url, []);
    byRoute.get(route.url).push({ agentName, r, ins });
  }
  for (const [url, runs] of byRoute) {
    const statuses = runs.map((x) => `${x.agentName}=${x.r.status}`).join(" ");
    // Compare what the page SAYS, not how many bytes it took to say it. Next.js
    // streams to JS-capable bots (Googlebot) and sends fully-resolved HTML to
    // HTML-limited ones (bingbot), so byte counts legitimately differ by agent
    // while the content is identical. Only a content difference is a defect.
    const fingerprint = (x) => JSON.stringify([x.ins.title, x.ins.productLinks, x.ins.productJsonLd, x.ins.price, x.ins.availability, x.ins.canonical]);
    const prints = new Set(runs.map(fingerprint));
    console.log(`   ${url}`);
    console.log(`      ${statuses}   links=${runs[0].ins.productLinks}   bytes≈${runs[0].r.bytes}`);
    if (prints.size > 1) console.log(`      !! content differs by user agent — the server must not vary public content by UA`);
    const probs = [...new Set(runs.flatMap((x) => x.ins.findings))];
    probs.forEach((p) => console.log(`      !! ${p}`));
  }

  // ---- repeated requests (cache behaviour) ------------------------------
  console.log("\n── repeated requests (same URL twice, warm)");
  for (const route of REQUIRED.filter((r) => r.family !== "home")) {
    const a = await get(route.url, { agent: AGENTS.aicrawler });
    const b = await get(route.url, { agent: AGENTS.aicrawler });
    record(a, route.family, `${route.url} [repeat-1]`);
    record(b, route.family, `${route.url} [repeat-2]`);
    const cc = a.headers["cache-control"] || "(none)";
    const cf = a.headers["cf-cache-status"] || "absent";
    console.log(`   ${route.url}`);
    console.log(`      ${a.status}/${b.status}  ${a.ms}ms/${b.ms}ms  cf-cache-status=${cf}`);
    console.log(`      cache-control: ${cc}`);
  }

  // ---- query-string cache separation ------------------------------------
  console.log("\n── query-string separation (must not collapse to one cache entry)");
  const qsUrls = ["/catalog/all", "/catalog/all?category=engine", "/catalog/all?q=75+series"];
  const qsSeen = [];
  for (const u of qsUrls) {
    const r = await get(u, { agent: AGENTS.aicrawler });
    const ins = record(r, "catalog", `${u} [qs]`);
    qsSeen.push({ u, links: ins.productLinks, bytes: r.bytes, title: ins.title });
    console.log(`   ${u.padEnd(34)} links=${String(ins.productLinks).padEnd(4)} bytes=${r.bytes}`);
  }
  const identical = qsSeen.length > 1 && qsSeen.every((x) => x.bytes === qsSeen[0].bytes && x.links === qsSeen[0].links);
  if (identical) console.log("   !! all query variants returned identical bodies — cache key may ignore the query string");
  else console.log("   ok: query variants return distinct documents");

  // ---- edge cases -------------------------------------------------------
  console.log("\n── edge cases");
  for (const ec of EDGE_CASES) {
    const r = await get(ec.url, { agent: AGENTS.aicrawler });
    record(r, ec.family, `${ec.url} [edge]`, { expect: ec.expect });
    const verdict = r.status === ec.expect ? "ok" : `!! expected ${ec.expect}`;
    let note = "";
    if (ec.family === "product-missing" && r.status === 200) note = " — 200 empty shell for a nonexistent product";
    console.log(`   ${ec.url.padEnd(38)} ${r.status}  ${verdict}${note}`);
  }

  // ---- sitemap sample ---------------------------------------------------
  console.log(`\n── sitemap sample (${SITEMAP_SAMPLE} urls)`);
  const pool_ = [...new Set(locs)].sort(() => Math.random() - 0.5).slice(0, SITEMAP_SAMPLE);
  const sampled = await pool(pool_, async (u) => {
    const path = u.replace(ORIGIN, "");
    const family = path.startsWith("/product/") ? "product" : path.startsWith("/catalog") ? "catalog" : "page";
    const r = await get(path, { agent: AGENTS.aicrawler });
    return { r, family, path };
  });
  let sOk = 0;
  for (const { r, family, path } of sampled) {
    const ins = record(r, family, `${path} [sitemap]`);
    if (r.status === 200 && ins.findings.length === 0) sOk++;
    else console.log(`   !! ${path} -> ${r.status} ${ins.findings.join("; ")}`);
  }
  console.log(`   ${sOk}/${sampled.length} sampled sitemap urls clean`);

  // ---- images -----------------------------------------------------------
  console.log("\n── primary images from rendered HTML");
  const imgFails = [];
  for (const pid of ["/product/200", "/product/2115"]) {
    const r = await get(pid, { agent: AGENTS.aicrawler });
    const og = (r.body.match(/property="og:image"\s+content="([^"]+)"/) || [])[1];
    if (!og) { imgFails.push(`${pid}: no og:image`); console.log(`   !! ${pid} no og:image`); continue; }
    const ir = await get(og.replace(ORIGIN, ""), { agent: AGENTS.aicrawler });
    const ct = ir.headers["content-type"] || "";
    const ok = ir.status === 200 && ct.startsWith("image/");
    if (!ok) imgFails.push(`${og}: ${ir.status} ${ct}`);
    console.log(`   ${ok ? "ok" : "!!"} ${ir.status} ${ct} ${og.replace(ORIGIN, "")}`);
  }

  // ---- first bytes of HTML ----------------------------------------------
  console.log("\n── first 700 bytes of returned HTML (proof of real content)");
  for (const route of REQUIRED) {
    const r = await get(route.url, { agent: AGENTS.aicrawler, cold: true });
    console.log(`\n   ══ ${route.url}  [${r.status}]  ${r.bytes}B`);
    console.log(`   cache-control: ${r.headers["cache-control"] || "(none)"}`);
    console.log(`   cf-cache-status: ${r.headers["cf-cache-status"] || "absent"}`);
    console.log("   " + short(r.body.replace(/\s+/g, " "), 700));
  }

  // ---- summary ----------------------------------------------------------
  const required = results.filter((x) => x.required);
  const failures = results.filter((x) => x.status !== 200 && !x.expect);
  const edgeFails = results.filter((x) => x.expect && x.status !== x.expect);
  const ssrFails = results.filter((x) => !(x.expect && x.expect !== 200 && x.status === x.expect)).filter((x) =>
    x.ins.findings.some((f) => /requires JavaScript|loading shell|false initial state|empty shell|product name missing/.test(f))
  );
  const noindexed = results.filter((x) => x.ins.noindex);

  console.log("\n\n════════════════════ SUMMARY ════════════════════");
  console.log(`PUBLIC URLS TESTED:            ${results.length}`);
  console.log(`SUCCESS:                       ${results.filter((x) => x.status === 200).length}`);
  console.log(`FAILURES:                      ${failures.length + edgeFails.length}`);
  console.log(`INTENTIONAL NON-INDEXABLE:     ${noindexed.length} (noindex meta, still crawlable)`);
  console.log(`SERVER-RENDERING FAILURES:     ${ssrFails.length}`);
  console.log(`CLOUDFLARE/EDGE FAILURES:      ${results.filter((x) => x.status === 0 || x.status >= 500).length}`);
  console.log(`IMAGE FAILURES:                ${imgFails.length}`);
  if (failures.length || edgeFails.length) {
    console.log("\nFAILURE DETAIL:");
    for (const f of [...failures, ...edgeFails]) {
      console.log(`  ${f.url}`);
      console.log(`     status ${f.status}${f.expect ? ` (expected ${f.expect})` : ""}${f.error ? ` — ${f.error}` : ""}`);
      f.ins.findings.forEach((x) => console.log(`     ${x}`));
    }
  }
  for (const f of imgFails) console.log(`  IMAGE: ${f}`);

  if (JSON_OUT) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(JSON_OUT, JSON.stringify(results.map(({ headers, ...r }) => ({ ...r, headers })), null, 2));
    console.log(`\nwrote ${JSON_OUT}`);
  }

  const hardFail = required.some((x) => x.status !== 200) || edgeFails.length > 0 || ssrFails.length > 0;
  console.log(`\nRESULT: ${hardFail ? "FAIL" : "PASS"}\n`);
  process.exit(hardFail ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
