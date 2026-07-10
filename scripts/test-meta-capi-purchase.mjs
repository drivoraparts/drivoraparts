/**
 * Send a FREE Meta Conversions API test Purchase (no real payment needed).
 *
 * 1. Events Manager → pixel → Test events → copy "Test event code" (e.g. TEST12345)
 * 2. Set env:
 *      META_CAPI_ACCESS_TOKEN=...
 *      META_CAPI_TEST_EVENT_CODE=TEST12345
 * 3. Run: node scripts/test-meta-capi-purchase.mjs
 * 4. Watch Test events tab — Purchase should appear in seconds
 */
import { createHash } from "node:crypto";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1275857431290062";
const TOKEN = process.env.META_CAPI_ACCESS_TOKEN?.trim();
const TEST_CODE = process.env.META_CAPI_TEST_EVENT_CODE?.trim();

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

if (!TOKEN) {
  console.error("Missing META_CAPI_ACCESS_TOKEN");
  process.exit(1);
}
if (!TEST_CODE) {
  console.error(
    "Missing META_CAPI_TEST_EVENT_CODE — copy it from Events Manager → Test events"
  );
  process.exit(1);
}

const orderId = `test-capi-${Date.now()}`;
const body = {
  data: [
    {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: orderId,
      event_source_url: "https://drivoraparts.com/success",
      action_source: "website",
      user_data: {
        em: [sha256("test@drivoraparts.com")],
      },
      custom_data: {
        currency: "USD",
        value: 1.0,
        order_id: orderId,
        content_type: "product",
        content_ids: ["2077"],
        contents: [{ id: "2077", quantity: 1, item_price: 1.0 }],
        num_items: 1,
      },
    },
  ],
  test_event_code: TEST_CODE,
};

const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`;
const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
if (!res.ok || json.error) process.exit(1);
console.log("\nOK — check Events Manager → Test events for Purchase");
