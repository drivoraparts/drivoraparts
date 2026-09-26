/**
 * Pre-deploy guard: refuse to push a bundle built where bundling is known broken.
 *
 * On 2026-09-26 a locally built bundle went to production and every route
 * returned 500. The worker logs were all the same shape:
 *
 *   ⨯ TypeError: components.ComponentMod.handler is not a function
 *   ⨯ ChunkLoadError: Failed to load chunk
 *     server/chunks/ssr/[root-of-the-server]__20elttj._.js
 *     from runtime for chunk server/app/(storefront)/page.js
 *
 * Turbopack names about a quarter of the SSR chunks
 * `[root-of-the-server]__<hash>._.js`. Square brackets are a character class
 * in a glob, so that filename read as a pattern matches one character from
 * `root-f-thesv` followed by `__20elttj._.js` -- i.e. nothing. A bundling step
 * that collects chunks by glob silently skips every bracketed one, and the
 * worker ships with runtime requires pointing at chunks it does not carry.
 *
 * Observed, not theorised:
 *   - Windows build  -> all routes 500, locally under workerd and in production
 *   - Linux CI build -> deployed 2026-09-26 18:25Z, served fine
 * Both from the same commit.
 *
 * WHY THIS CHECKS THE PLATFORM AND NOT THE BUNDLE
 *
 * The first version of this script compared each chunk's source against
 * handler.mjs to find chunks referenced but not inlined. It reported the
 * Windows bundle as broken -- correctly -- but testing it against the
 * non-bracketed chunks in that same bundle showed 224 of 232 flagged too:
 * esbuild rewrites chunk bodies while bundling, so substring probes miss
 * chunks that are genuinely present. The check could not tell a broken bundle
 * from a sound one, so it would have blocked Linux CI as well.
 *
 * Static analysis of the output is therefore not a reliable signal here. The
 * only sound check is empirical -- boot the bundle in workerd and request a
 * page, which is what `npx opennextjs-cloudflare preview` does and how the
 * fault was found. That is too slow for a deploy gate, so this encodes the
 * platform finding instead, and says how to verify properly.
 *
 * This is a heuristic, deliberately. If upstream fixes the bracket handling,
 * delete this script and drop it from the three scripts in package.json that
 * call it.
 */
const BUILD_OK_PLATFORMS = new Set(["linux", "darwin"]);

if (BUILD_OK_PLATFORMS.has(process.platform)) {
  console.log(`✓ worker bundle built on ${process.platform} — deploy allowed`);
  process.exit(0);
}

console.error(
  `
❌ Refusing to deploy a bundle built on ${process.platform}.

OpenNext bundling drops Turbopack's bracket-named SSR chunks here, so the
worker ships importing chunks it does not contain. It builds clean, passes
verify-opennext-output, renders under \`next dev\` — and then returns 500 on
every route in production. That happened on 2026-09-26.

Ship it from CI, which builds on ubuntu-latest and deploys:

  gh workflow run pages-build.yml

or push to main, which triggers the same workflow. To re-run a job that
failed for an unrelated reason:

  gh run rerun <run-id>

To see the failure for yourself on this machine:

  npx opennextjs-cloudflare preview      # then open the homepage — it 500s

Background and how to remove this guard: the comment at the top of
scripts/verify-worker-chunks.mjs.
`.trim() + "\n"
);

process.exit(1);
