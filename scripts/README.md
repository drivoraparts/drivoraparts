# Scripts

## Safe

- `remove-edge-runtime-ui.mjs` — one-time helper to strip obsolete `runtime = 'edge'` exports (OpenNext uses Node runtime on Workers)

## Removed (do not restore)

Legacy `@cloudflare/next-on-pages` helpers were deleted — they injected edge runtime and break OpenNext builds.

Production deploy: see `docs/CLOUDFLARE-DEPLOY.md`.
