# OpenNext Cloudflare Migration (Phase 2)

Dual-build migration from `@cloudflare/next-on-pages` to `@opennextjs/cloudflare`.
Production stays on the **legacy** pipeline until OpenNext is validated.

## Build commands

| Script | Purpose | Production default |
|--------|---------|-------------------|
| `npm run build` | Standard Next.js build | No |
| `npm run pages:build` | Legacy `@cloudflare/next-on-pages` | **Yes (until cutover)** |
| `npm run open-next:build` | New `@opennextjs/cloudflare` | After cutover |
| `npm run preview:cloudflare` | Local Workers runtime preview | Testing only |
| `npm run deploy:cloudflare` | Build + deploy via Wrangler | After cutover |

## Legacy output (next-on-pages)

- Build: `npm run pages:build`
- Cloudflare Pages output directory: `.vercel/output/static`

## OpenNext output

- Build: `npm run open-next:build`
- Worker entry: `.open-next/worker.js`
- Static assets: `.open-next/assets`

## Phase checklist

### Phase 1–3 — Done in repo

- [x] `@opennextjs/cloudflare` installed
- [x] `@cloudflare/next-on-pages` kept as devDependency (rollback)
- [x] `open-next.config.ts` + `wrangler.jsonc`
- [x] Dual scripts in `package.json`
- [x] `initOpenNextCloudflareForDev()` in `next.config.ts`
- [x] `public/_headers` for static asset caching

### Phase 4 — Validate OpenNext locally

```bash
npm ci
npm run open-next:build
npm run preview:cloudflare
```

Verify:

- [ ] `/catalog`, `/product/[id]`, `/cart`, `/checkout`
- [ ] `/admin/dashboard` and auth middleware
- [ ] `/api/checkout`, `/api/auth/login`, payment webhooks

**Note:** OpenNext requires Node runtime on all routes. Edge exports were removed from auth/checkout/payment API routes (OpenNext + next-on-pages both use `nodejs_compat` on Cloudflare).

### Phase 5 — Edge compatibility

OpenNext runs **Node.js runtime** on Workers (`nodejs_compat`). After cutover, remove edge exports from:

- `app/api/auth/*`
- `app/api/checkout/route.ts`
- `app/api/payments/*`
- `app/api/public/store-config/route.ts`
- `app/api/admin/login|logout`

Run: `node scripts/remove-edge-runtime-ui.mjs` (already strips UI; extend for all API routes at cutover).

### Phase 6 — Cloudflare dashboard switch (only after Phase 4 passes)

**OLD (rollback):**

```
Build command: npm ci && npm run pages:build
Output directory: .vercel/output/static
```

**NEW:**

```
Build command: npm ci && npm run open-next:build
Output directory: .open-next/assets
```

Or use Workers deploy: `npm run deploy:cloudflare`

### Phase 7 — Rollback

Revert Cloudflare build command to `npm run pages:build` and output `.vercel/output/static`.
Keep `@cloudflare/next-on-pages` in devDependencies until 24h stability on OpenNext.

## CI

`.github/workflows/pages-build.yml`:

- **Job `legacy-build`** — production path (`pages:build`)
- **Job `opennext-validate`** — runs `open-next:build` in parallel (does not deploy)

Remove legacy job only after Phase 6 + 24h stability.
