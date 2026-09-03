import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

/**
 * Incremental cache store.
 *
 * READ THIS BEFORE RELYING ON IT: nothing currently uses this cache. It is
 * configured and the binding is live on the deployed Worker, but the KV
 * namespace stays empty however much traffic the site takes, because no route
 * reaches the runtime cache:
 *
 *   - the 246 prerendered routes (/catalog/[category], /vehicles/[slug] and
 *     friends) are force-static and served from the asset bundle;
 *   - /catalog/all is force-dynamic on purpose, so search and filtering stay
 *     live per request;
 *   - /product/[id] declares `revalidate = 3600` but is dynamically rendered,
 *     because a dynamic segment without generateStaticParams is dynamic
 *     whatever revalidate says. The hour has never applied.
 *
 * Adding `generateStaticParams` returning [] does make it ISR, and that was
 * tried: it builds clean, typechecks, passes pages:build, and then every
 * product page 500s in the Worker with
 *
 *   ChunkLoadError: Failed to load chunk
 *   server/chunks/ssr/[root-of-the-server]__0iase11._.js
 *
 * Turbopack emits a server chunk whose filename contains square brackets and
 * the OpenNext bundler does not resolve it for this route; the dynamic path
 * never loads that chunk, so the fault only appears once the route is ISR and
 * only in the bundled Worker, never in the build. Reverted in 16d08f5.
 * Reproduce with `wrangler dev` against .open-next, not in production.
 *
 * If that is ever fixed, the cache below starts working with no further
 * change, and product pages become up to an hour stale in their review counts
 * and view figures only. Price and stock cannot go stale beyond a deploy: that
 * data is compiled into the bundle at build time (admin edits are committed to
 * lib/inventory/data/*.json through GitHub, which triggers a rebuild) and cache
 * keys are namespaced by OPEN_NEXT_BUILD_ID, so every deploy starts cold.
 * Nothing calls revalidatePath or revalidateTag, so no tag cache is needed.
 *
 * KV rather than the R2 store OpenNext recommends only because R2 is not
 * enabled on this Cloudflare account — the API refuses with code 10042 and it
 * has to be switched on in the dashboard by a person. R2 is the better store
 * here if this is ever revisited: KV allows 1,000 writes a day on the free
 * tier and a crawl of 1,889 products on a cold cache would exceed that.
 * Moving across is the binding in wrangler.jsonc plus the import above.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "short-lived" }),
});
