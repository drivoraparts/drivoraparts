const urls = [
  "https://drivoraparts.com/",
  "https://drivoraparts.com/home",
  "http://drivoraparts.com/",
  "https://drivoraparts.com/catalog/all?q=fox",
  "https://drivoraparts.com/aftermarket",
  "https://drivoraparts.com/catalog/aftermarket",
  "https://drivoraparts.com/admin",
  "https://drivoraparts.com/admin/login",
];

for (const url of urls) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    const canon =
      html.match(/rel="canonical" href="([^"]+)"/i)?.[1] ??
      html.match(/"canonical":"([^"]+)"/i)?.[1] ??
      "NONE";
    console.log(`${res.status} ${res.url}`);
    console.log(`  requested: ${url}`);
    console.log(`  canonical: ${canon}\n`);
  } catch (e) {
    console.log(`ERR ${url}: ${e.message}\n`);
  }
}
