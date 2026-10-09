# Shipping rates and Merchant Center settings

The published rates live in `lib/shipping/rate-table.ts`. Checkout
(`/api/checkout`, `/api/shipping/quote`), the shipping policy page, product
pages, Google structured data (`lib/seo/merchant-policies.ts`) and the Google
Merchant feed (`/api/feeds/google-merchant.tsv`) all read from that file, so
change the numbers there and nowhere else. `npm run test:shipping` checks them.

All charges are made in **USD**. Pound and Australian-dollar figures are fixed,
approximate display text; no charge is ever recalculated from a live exchange
rate.

## Parcel rates (shipping_label = `parcel`)

| Destination | Free from (cart subtotal, before discounts) | Below that |
|---|---|---|
| United States | under $1,000 free; brackets up to $74,999.99 ($100 – $900) | see table in `rate-table.ts` |
| United Kingdom | **$200.00** (about £151) | **$33.00** (about £25) |
| Australia | **$55.56** (about A$80) | **$28.00** (about A$40) |

UK/AU amounts were converted once from GBP/AUD at the ECB euro reference rates
of 2026-10-08 (1 EUR = 1.1186 USD = 0.84698 GBP = 1.6110 AUD). The UK threshold
of $200 was set in USD by the business.

A cart is priced only when every item is a parcel and the destination is the
US, the UK (Great Britain and Northern Ireland; not the Channel Islands or the
Isle of Man) or Australia. Otherwise the order is created with shipping
"to be quoted" (`orders.shipping_basis = 'manual_quote'`), cryptocurrency is not
offered, and the order cannot be marked paid until an admin quotes shipping.

## Freight and multi-box (shipping_label = `freight` / `multibox`)

No published rate in any country (`FREIGHT_RATE_TABLES` are all `null`).
These products get no Merchant Center shipping service, so they are not listed
on Google, and their orders are quoted before payment.

## Delivery times

Handling 1–5 days, transit 5–15 business days, for the US, UK and Australia.

## Returns

30 days from delivery, by mail, new/unused and uninstalled in original
packaging, customer pays return shipping, authorization required first:
`/policies/refund-policy`.

## Merchant Center (configure only after the code is deployed)

1. Product feed `https://drivoraparts.com/api/feeds/google-merchant.tsv`,
   daily, English, target countries United States, United Kingdom, Australia.
2. One shipping service per country, products = shipping label `parcel`:
   - US: price-based table, 17 brackets (as `US_PARCEL_RATE_TABLE`).
   - UK: free for order value ≥ $200.00, otherwise flat $33.00.
   - AU: free for order value ≥ $55.56, otherwise flat $28.00.
   - Delivery: handling 1–5 days, transit 5–15 business days.
3. Return policy per country (US, UK, AU) with the terms above.
4. No service for `freight` or `multibox`.

Verify in the Merchant Center interface before activating: which currency it
requires for UK and Australian shipping services (if it requires GBP/AUD, the
amounts must be entered as the converted figures above and will drift from the
USD charge with exchange rates), and that USD prices are converted for UK and
Australian listings. Confirm UK VAT and Australian GST obligations for imported
goods before listing in those countries.
