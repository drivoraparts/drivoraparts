# Toyota Catalog Data Sources — Assessment

Tested 2026-11-18/19 from this repository's cloud environment. "Accessed" means read or called by an automated request that respected the site's robots rules and access controls. No access control, rate limit or login was bypassed, no account was created, and nothing was purchased.

## Summary

| Source | Toyota part numbers | US fitment | Supersessions | Specs | Retail prices | Supplier cost | Stock | Images | Commercial reuse | API / bulk | Account | Result here |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Toyota official (autoparts.toyota.com, parts.toyota.com) | Yes | Yes (rendered in browser only) | Yes | Some | MSRP only ("dealer sets actual price") | No | No | Yes (not licensed for reuse) | No licence offered | No public API | No | Readable: identity + MSRP. Fitment needs JavaScript |
| Toyota Parts & Service charts (toyotapartsandservice.com) | Yes | Yes (by model/year/engine code) | Partly | No | No | No | No | No | Reference use | PDF charts | No | Read: oil filter (2021) and spark plug (2022) charts |
| Toyota wholesale channels (TPCO, RepairLink, Microcat Partsbridge) | Yes | Yes | Yes | Yes | Wholesale | **Yes (dealer wholesale cost)** | Via dealer | Varies | Account terms | Ordering systems | Wholesale customer account through a Toyota dealer | Not accessible without an account |
| ToyotaPartsDeal | Yes | Yes (model codes, notes) | Yes | Weight, dims | Yes | No | "Ships in 1-3 days" | Yes (not licensed) | No | No | No | Category page read, then firewall block after 5 requests. Operated by Original Parts Giant: a retailer, not a dealer |
| ToyotaPartsNow | Yes | Yes | Yes | Some | Yes | No | Yes | Yes (not licensed) | No | No | No | Same platform as ToyotaPartsDeal; robots allow product pages |
| Toyota OEM Parts Online / Modern Toyota Wholesale Direct / Lakeland (RevolutionParts dealer stores) | Yes | Yes ("This part fits") | Yes | Some | Yes | No | No | Yes (not licensed) | No | No | No | **Cloudflare block** on automated requests; robots ask AI agents for a 10 s delay |
| Other dealer stores (Olathe, Sparks, Capo Valley, Longo, Ourisman, American Toyota, AutoNation, Venice, Chapel Hill) | Yes | Yes | Yes | Some | Yes | No | No | Not licensed | No | No | No | Used via web-search index of their pages |
| plan.parts | Yes (Toyota/Lexus OEM catalog: EU, JP, US markets) | VIN and frame lookup, diagrams | Yes | No | No | No | No | Diagrams | "Programmatic access" to third-party data; reuse terms not published | REST API, pay per result (about $50 per 50,000 tokens; free tokens on signup) | API key (signup) | Docs read; not called (needs account) |
| GooFuture Toyota Parts API | Yes (EPC-derived) | VIN / frame / model year; production-date splits; North America frames | Yes | Quantities | No | No | No | Exploded diagrams | Governed by service agreement | JSON API: trial ¥0 (≤1,000 calls/month), Standard ¥1,980/month (≤100,000) | Trial request | Docs read; not called (needs trial) |
| Cruisin4Parts (site + MCP connector) | Yes (4Runner, Land Cruiser, Tacoma, Tundra only) | Catalog by frame / part group | Yes | Little | Yes: about 9-13 sellers per part with check dates (US dealers + overseas) | No | Per seller | Third-party (e.g. PartSouq credit) | Personal-use site; no reseller terms published | MCP for Claude / Claude Code / ChatGPT: catalog lookups free and unmetered; price comparisons 15/month free, unlimited on Premium ($1.99/month or $19.99/year) | Free account + OAuth sign-in | Public part page read (MSRP, cached prices, sellers hidden). Connector not connected |
| SEMA Data Co-op (apps.semadata.org/sdapi/v2) | Aftermarket brands (AAIA brand IDs), not Toyota OEM | Yes (ACES applications, Y/M/M/S, engine) | Brand data | Yes (PIES attributes, descriptions) | Price sheets (MAP/jobber/retail per brand) | **Brand price sheets** (dealer/jobber where the brand publishes them) | Inventory endpoint (where supplied) | **Yes, digital assets endpoint (manufacturer images)** | Per brand authorization | REST API + bulk products + exports | Reseller account + Data Subscription (required since 2024-04-08). Free "Launch" tier; paid tiers about $25-75/month | Docs read; unauthenticated call refused as expected |
| Turn 14 Distribution | Aftermarket (Bilstein, Eibach, ARB, etc. where authorized) | Yes (where supplied) | — | Yes | MAP / retail | **Dealer price** | Per warehouse | Yes | Per account | REST API (sandbox first), dropship ordering | Approved dealer account + API approval | Not accessible without an account |
| Auto Care ACES 5.0 / PIES 8.0 | Standard, not data | VCdb vehicle database | PCdb | PAdb | — | — | — | — | Licence per subscription | XML standards | Paid subscription: entry package about $2,500/year (members, < $1M revenue); PIES tiers $1,050-$4,410 | Not purchased |
| Openverse / Wikimedia Commons | — | — | — | — | — | — | — | Licensed images only | Yes (per licence) | API | No | Searched every batch-1 part number: no match |

## What each one means for the 900-product target

1. **Supplier cost exists only behind an account.** No public source publishes acquisition cost. The candidates are a Toyota dealer wholesale account (genuine OEM), Turn 14 (aftermarket brands) and SEMA Data brand price sheets (aftermarket). Without one, every product stays REVIEW REQUIRED.
2. **Licensed images exist only through brand data.** SEMA Data digital assets carry the manufacturer's own images for aftermarket brands. Toyota and dealer photos are not licensed for reuse.
3. **OEM fitment at scale needs an EPC-style API.** plan.parts and GooFuture both expose Toyota EPC structure (VIN / frame / production-date splits). Cruisin4Parts covers four models with free catalog lookups and dated supplier prices.
4. **The current pipeline already accepts this data.** Staged records use `fitmentApplications` (year/make/model/submodel) plus an evidence block; an ACES application maps onto that shape directly. A PIES or SEMA product (part number, brand, descriptions, attributes, digital assets, prices) maps onto the existing record fields. No new database or architecture is needed — a source adapter that writes staged records like `scripts/build-toyota-expansion-batch-2.py` does, checked by `scripts/check-toyota-expansion.mjs`.

## Authorizations only you can give

Each is free to start or under $25/month, needs your identity or business details, and none was done on your behalf:

1. **Cruisin4Parts connector** (fastest, free): create a free account at cruisin4parts.com, then add the connector at https://claude.ai/customize/connectors using the server URL from Cruisin4Parts' *Account settings → MCP connector*, and start a new session. Connectors are read when a session starts. Covers 4Runner, Tacoma and Tundra.
2. **SEMA Data reseller account** (free Launch tier): unlocks aftermarket brand products, ACES fitment, digital assets (licensed images) and brand price sheets through the documented API.
3. **plan.parts or GooFuture API key** (free tokens / free trial): Toyota OEM catalog by VIN or frame for all nine models. Save the key with the environment's secret store when prompted (the proxy injects it; it is never pasted in chat).
4. **Toyota dealer wholesale account or Turn 14 dealer account**: the only route to real supplier cost and dropship.

Sources: [Cruisin4Parts MCP](https://cruisin4parts.com/toyota-parts-mcp-server), [SEMA Data API v2](https://apps.semadata.org/sdapi/v2), [SEMA Data subscriptions](https://www.semadata.org/news/tue-2023-06-27-0955/new-reseller-data-subscription-service), [plan.parts](https://plan.parts/), [GooFuture Toyota Parts API](https://www.goofuture.com/en-us/toyota-parts-api/), [Auto Care subscriptions](https://www.autocare.org/data-standards/subscriptions), [Turn 14 API (integrator documentation)](https://support.flxpoint.com/en_US/automotives-parts/turn-14-as-a-source), [Toyota Parts & Service](https://www.toyotapartsandservice.com/).
