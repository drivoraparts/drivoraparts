import fs from "node:fs";
import https from "node:https";

const src = fs.readFileSync("lib/inventory/products.ts", "utf8");
const paths = [...src.matchAll(/"(\/product-media\/[^"]+)"/g)].map((m) => m[1]);

function head(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        method: "HEAD",
        hostname: "drivoraparts.com",
        path: encodeURI(path),
        timeout: 15000,
      },
      (res) => {
        resolve({ path, status: res.statusCode ?? 0 });
      }
    );
    req.on("error", (err) => resolve({ path, status: 0, err: err.message }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ path, status: 0, err: "timeout" });
    });
    req.end();
  });
}

const batchSize = 20;
let ok = 0;
const fails = [];

for (let i = 0; i < paths.length; i += batchSize) {
  const batch = paths.slice(i, i + batchSize);
  const results = await Promise.all(batch.map(head));
  for (const r of results) {
    if (r.status >= 200 && r.status < 400) ok++;
    else fails.push(r);
  }
  process.stdout.write(`\rChecked ${Math.min(i + batchSize, paths.length)}/${paths.length}`);
}

console.log(`\nOK: ${ok}  Failed: ${fails.length}`);
for (const f of fails.slice(0, 30)) {
  console.log(`${f.path} -> ${f.status}${f.err ? ` (${f.err})` : ""}`);
}
