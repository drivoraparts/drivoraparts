# Cloudflare Deployment (OpenNext)

## Adapter

Use **`@opennextjs/cloudflare` only**. Do **not** install `@cloudflare/next-on-pages` (incompatible with `next@15.5.19`).

## Runtime (important)

**Do not add `export const runtime = "edge"`** to pages or routes.

OpenNext runs the **Node.js runtime** on Cloudflare Workers via `nodejs_compat` (see `wrangler.jsonc`). Edge runtime exports **break** `opennextjs-cloudflare build`.

Legacy edge-injection scripts in `scripts/` must not be run.

## Cloudflare dashboard (Git-connected project)

| Setting | Value |
|---------|--------|
| **Node version** | `20` |
| **Build command** | `npm ci && npm run pages:build` |
| **Deploy command** (if separate) | `npx opennextjs-cloudflare deploy` |

Do **not** set output directory to `.vercel/output/static` (next-on-pages legacy).

OpenNext produces:

- `.open-next/worker.js` — Worker entry (SSR + API)
- `.open-next/assets/` — static assets

## Local commands

```bash
nvm use          # Node 20 (.nvmrc)
npm ci
npm run dev
npm run pages:build
npm run preview:cloudflare
npm run deploy:cloudflare
```

## Route compatibility

Admin, auth, checkout, and payment routes use:

- `cookies()` / `headers()` from Next.js (supported on OpenNext Node runtime)
- `crypto.subtle` (Web Crypto — edge-compatible)
- Supabase HTTP client + `fetch` (no Prisma/fs)

No route changes required for Cloudflare when using OpenNext.

## Config files

- `open-next.config.ts`
- `wrangler.jsonc`
- `next.config.ts` — `initOpenNextCloudflareForDev()`
