# Cloudflare Pages — Production Deploy (OpenNext)

## Why builds fail with "Edge Runtime" errors

That error comes from **`@cloudflare/next-on-pages`**, not OpenNext.

It appears when Cloudflare runs the **Next.js framework preset** or `npx @cloudflare/next-on-pages`, which requires `export const runtime = "edge"` on every route. This repo uses **`@opennextjs/cloudflare`** with **Node.js on Workers** — do **not** add edge runtime exports.

## Required Cloudflare dashboard settings

| Setting | Correct value | Wrong value (causes failures) |
|---------|---------------|-------------------------------|
| **Framework preset** | **None** | Next.js (uses next-on-pages) |
| **Node.js version** | **20** | 22+ / 24 |
| **Build command** | `npm ci && npm run pages:build` | `npm run build` alone |
| **Deploy command** (if available) | `npm run pages:deploy` | — |
| **Output directory** | `.open-next/assets` (dashboard only) | `.vercel/output/static` |

Do **not** add `pages_build_output_dir` to `wrangler.jsonc` — it conflicts with OpenNext's `ASSETS` binding. Set output directory in the Cloudflare dashboard only.

### Alternative (Workers deploy — recommended)

Use the OpenNext CLI deploy (includes Worker + assets):

```bash
npm ci
npm run pages:build
npm run pages:deploy
```

Set `CLOUDFLARE_API_TOKEN` in CI or dashboard.

## Repository rules (enforced in CI)

- ✅ `@opennextjs/cloudflare` only — no `@cloudflare/next-on-pages`
- ✅ **No** `export const runtime = "edge"` in `app/` (OpenNext uses Node on Workers)
- ✅ Build output: `.open-next/worker.js` + `.open-next/assets/`
- ✅ `npm run verify:cloudflare` runs before every `pages:build`
- ✅ `npm run verify:opennext` runs after every `pages:build`
- ❌ **Never** use `.vercel/output/static` (next-on-pages legacy)

## Local verification (match Cloudflare)

```bash
nvm use          # Node 20
npm ci
npm run pages:build
# expect: .open-next/worker.js exists, "OpenNext build complete"
npm run preview:cloudflare   # optional smoke test
```

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Plain Next.js build (internal; used by OpenNext) |
| `npm run pages:build` | **Cloudflare production build** |
| `npm run pages:deploy` | **Cloudflare production deploy** |

## If deploy still fails

1. Confirm **Framework preset = None** in Cloudflare Pages settings.
2. Search build logs for `@cloudflare/next-on-pages` — if present, the dashboard is still on the legacy adapter.
3. Confirm Node **20** in Cloudflare build environment.
4. Do not run scripts in `scripts/` that inject edge runtime (removed from repo).
