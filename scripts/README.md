# Scripts

## Production (Cloudflare / OpenNext)

- `verify-cloudflare-config.mjs` — pre-build guard (no next-on-pages, no edge runtime in `app/`)
- `verify-opennext-output.mjs` — post-build guard (`.open-next/worker.js` + assets exist)
- `remove-edge-runtime-ui.mjs` — one-time helper to strip obsolete edge exports

Run via `npm run verify:cloudflare` or automatically in `npm run pages:build`.

Deploy guide: `docs/CLOUDFLARE-DEPLOY.md`.
