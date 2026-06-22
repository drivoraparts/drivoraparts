# Scripts

Do **not** run these in CI or before deploy:

- `add-edge-runtime.mjs` — bulk-injects `export const runtime = 'edge'` into UI routes (breaks OpenNext / Node architecture)
- `remove-edge-runtime-ui.mjs` — one-time cleanup helper
- `wrap-client-pages.mjs` — legacy next-on-pages workaround
- `move-edge-runtime-top.mjs` — legacy edge export ordering fix

Edge runtime is intentionally limited to auth, checkout, and payment API routes only.
