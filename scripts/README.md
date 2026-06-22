# Scripts

Do **not** run these in CI or before deploy:

- `add-edge-runtime.mjs` — bulk-injects `export const runtime = 'edge'` (obsolete; breaks OpenNext)
- `remove-edge-runtime-ui.mjs` — one-time cleanup helper
- `wrap-client-pages.mjs` — obsolete legacy adapter workaround
- `move-edge-runtime-top.mjs` — obsolete edge export ordering fix

Production uses `@opennextjs/cloudflare` with Node.js runtime on Workers (`nodejs_compat`).
