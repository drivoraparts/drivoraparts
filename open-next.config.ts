import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

/**
 * Incremental cache for ISR routes.
 *
 * There was no cache store at all before this, so `export const revalidate =
 * 3600` on /product/[id] had nowhere to put a render and every request rebuilt
 * the page — roughly two seconds each, with no `cf-cache-status` on any
 * response because a Worker's output is not edge-cached on its own.
 *
 * Staleness is bounded by the deploy, not just by the hour. Product data is
 * compiled into the bundle at build time (admin edits are committed to
 * lib/inventory/data/*.json through GitHub, which triggers a rebuild), and
 * cache keys are namespaced by OPEN_NEXT_BUILD_ID, so a deploy starts from a
 * cold cache and no entry can outlive the build it came from. /catalog/all is
 * `force-dynamic` and is not cached here at all, so search and filtering stay
 * live. Nothing in the app calls revalidatePath or revalidateTag, so no tag
 * cache is needed.
 *
 * KV rather than R2 only because R2 is not enabled on the Cloudflare account
 * (API code 10042 — it needs to be switched on in the dashboard). To move
 * across: create the bucket, bind it as NEXT_INC_CACHE_R2_BUCKET, and import
 * r2-incremental-cache in place of the KV line above.
 *
 * short-lived regional caching sits in front of KV so repeat hits in the same
 * data centre skip the KV round trip, and KV's eventual consistency (writes
 * take up to a minute to reach every region) never shows a reader something
 * older than the current build.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "short-lived" }),
});
