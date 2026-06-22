# Cloudflare Deployment (OpenNext)

Production builds use `@opennextjs/cloudflare` only. Legacy `@cloudflare/next-on-pages` has been removed (incompatible with `next@15.5.19`).

## Build commands

| Script | Purpose |
|--------|---------|
| `npm run build` | Standard Next.js build (used internally by OpenNext) |
| `npm run pages:build` | **Cloudflare production build** (OpenNext) |
| `npm run open-next:build` | Same as `pages:build` |
| `npm run preview:cloudflare` | Local Workers runtime preview |
| `npm run deploy:cloudflare` | Build + deploy via Wrangler |

## Cloudflare Pages settings

```
Build command:    npm ci && npm run pages:build
Output directory: .open-next/assets
Node version:     20
```

For Workers-style deploy: `npm run deploy:cloudflare`

## Output layout

- Worker entry: `.open-next/worker.js` (see `wrangler.jsonc`)
- Static assets: `.open-next/assets`

## Local dev

```bash
nvm use    # Node 20 from .nvmrc
npm ci
npm run dev
```

## Config files

- `open-next.config.ts` — OpenNext Cloudflare adapter
- `wrangler.jsonc` — Worker + assets binding (`nodejs_compat`)
- `next.config.ts` — `initOpenNextCloudflareForDev()` for local bindings
