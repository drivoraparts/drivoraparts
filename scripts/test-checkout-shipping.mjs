/**
 * Offline check of the shipping amount /api/checkout hands to order creation.
 *
 * Calls the real POST handler in app/api/checkout/route.ts with the order
 * service, email sender and payment modules REPLACED by recorders, so nothing
 * reaches Supabase, NOWPayments or an email provider and no order is created.
 * Any attempt to use the network fails the run.
 *
 *   node scripts/test-checkout-shipping.mjs
 *
 * What it proves: for a cart and a country typed at checkout, the `shipping`
 * the route passes to order creation equals what /api/shipping/quote (the
 * cart summary) shows. What it does not prove: the browser page, the payment
 * provider, or the order emails -- those still need a staging environment
 * with its own test credentials.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "checkout-ship-"));
const entry = path.join(tmp, "entry.ts");
const bundle = path.join(tmp, "entry.mjs");
const stubDir = path.join(tmp, "stubs");
fs.mkdirSync(stubDir);

const SERVICE_STUB = path.join(stubDir, "service.ts");
fs.writeFileSync(
  SERVICE_STUB,
  `export const calls: any[] = [];
export async function processCheckout(input: any) {
  calls.push(input);
  return { orderId: "TEST-ORDER", offline: true, payment: { mode: "manual", paymentUrl: null } } as any;
}
`
);
const NEXT_STUB = path.join(stubDir, "next-server.ts");
fs.writeFileSync(
  NEXT_STUB,
  `export class NextResponse extends Response {
  static json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
    return new Response(JSON.stringify(body), { status: init?.status ?? 200, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  }
}
`
);
const EMAIL_STUB = path.join(stubDir, "email.ts");
fs.writeFileSync(
  EMAIL_STUB,
  `export const emailCalls: any[] = [];
export async function sendAdminCheckoutFailedEmail(...args: any[]) { emailCalls.push(args); }
`
);

fs.writeFileSync(
  entry,
  `
import { POST } from ${JSON.stringify(path.join(ROOT, "app/api/checkout/route.ts").replace(/\\/g, "/"))};
import { quoteShipping } from "@/lib/shipping/rates";
import { getProductById } from "@/lib/inventory";
import { calls } from ${JSON.stringify(SERVICE_STUB.replace(/\\/g, "/"))};

(globalThis as any).fetch = () => { throw new Error("network access attempted"); };

const CASES: { name: string; productId: number; qty: number; country: string }[] = [
  { name: "parcel under free line, Canada", productId: 1027, qty: 1, country: "Canada" },
  { name: "parcel, US", productId: 1027, qty: 1, country: "United States" },
  { name: "parcel, United Kingdom", productId: 1027, qty: 1, country: "United Kingdom" },
  { name: "parcel above Canada free line", productId: 1415, qty: 1, country: "Canada" },
  { name: "freight, US", productId: 52, qty: 1, country: "USA" },
  { name: "freight, Canada", productId: 52, qty: 1, country: "canada" },
  { name: "freight, Germany", productId: 2042, qty: 1, country: "Deutschland" },
  { name: "freight, New Zealand", productId: 1523, qty: 1, country: "New Zealand" },
  { name: "parcel, Georgia (country)", productId: 825, qty: 1, country: "Georgia" },
  { name: "unlisted country is quoted", productId: 1027, qty: 1, country: "Japan" },
];

const out: any[] = [];
for (const c of CASES) {
  calls.length = 0;
  const product = getProductById(c.productId) as any;
  if (!product) { out.push({ name: c.name, error: "product not found" }); continue; }
  const quote = quoteShipping([{ productId: c.productId, quantity: c.qty, price: product.price }], c.country);
  const req = new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
    body: JSON.stringify({
      items: [{ productId: c.productId, quantity: c.qty }],
      customer: { fullName: "Test Buyer", email: "test@example.invalid", phone: "0000000", address: "1 Test St", city: "Testville", zip: "00000", country: c.country },
      provider: "manual",
      manualMethod: "paypal",
    }),
  });
  let status = 0, body: any = null;
  try { const res = await POST(req); status = res.status; body = await res.json(); } catch (e: any) { body = { thrown: String(e?.message ?? e) }; }
  out.push({
    name: c.name, status, quote: quote.status === "calculated" ? quote.amount : quote.reason,
    routeShipping: calls[0]?.shipping, basis: calls[0]?.shippingBasis, serviceCalls: calls.length, body: status === 200 ? undefined : body,
  });
}
console.log(JSON.stringify(out));
`
);

const { build } = await import("esbuild");
await build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundle,
  loader: { ".json": "json" },
  alias: { "@": ROOT },
  logLevel: "error",
  absWorkingDir: ROOT,
  tsconfigRaw: "{}",
  plugins: [
    {
      name: "stub-side-effects",
      setup(b) {
        b.onResolve({ filter: /^@\/lib\/checkout\/service$/ }, () => ({ path: SERVICE_STUB }));
        b.onResolve({ filter: /^@\/lib\/email\/send$/ }, () => ({ path: EMAIL_STUB }));
        b.onResolve({ filter: /^next\/server(\.js)?$/ }, () => ({ path: NEXT_STUB }));
      },
    },
  ],
});

let raw;
try {
  raw = execFileSync(process.execPath, [bundle], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, encoding: "utf8" });
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
const results = JSON.parse(raw.trim().split("\n").pop());

const problems = [];
for (const r of results) {
  if (r.error) { problems.push(`${r.name}: ${r.error}`); continue; }
  if (typeof r.quote === "number") {
    if (r.status !== 200) problems.push(`${r.name}: route status ${r.status} ${JSON.stringify(r.body)}`);
    else if (r.routeShipping !== r.quote) problems.push(`${r.name}: quote ${r.quote} but order shipping ${r.routeShipping}`);
  } else if (r.status === 200 && r.routeShipping !== 0) {
    problems.push(`${r.name}: unpriced (${r.quote}) but order shipping ${r.routeShipping}`);
  }
}
for (const r of results) {
  console.log(`  ${r.name}: quote=${r.quote} routeShipping=${r.routeShipping} status=${r.status} basis=${r.basis}`);
}
if (problems.length) {
  console.error(problems.map((p) => `  [checkout-shipping] ${p}`).join("\n"));
  process.exit(1);
}
console.log(`Checkout shipping check passed: ${results.length} cases, no order created, no network used.`);
