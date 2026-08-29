/**
 * Post-build patch: give the OpenNext worker a `scheduled` handler.
 *
 * Reconciliation used to be driven by GitHub Actions calling
 * /api/payments/reconcile over the public internet. That request is a normal
 * inbound hit on drivoraparts.com, so Cloudflare's bot protection challenged
 * it and the job never ran — for months, while reporting success.
 *
 * A Cloudflare cron trigger fires this worker directly, and the call to the
 * app goes over the WORKER_SELF_REFERENCE service binding, which is
 * worker-to-worker inside Cloudflare's network. It never crosses the edge, so
 * there is nothing for the WAF or Bot Fight Mode to challenge and no security
 * setting has to be weakened to let it through.
 *
 * The service binding is also why this cannot use a plain fetch(): the worker
 * runs with `global_fetch_strictly_public`, so a fetch to drivoraparts.com
 * would go out to the public internet and get challenged exactly like the
 * GitHub runner did.
 *
 * .open-next/worker.js is generated, so this rewrites it after every build.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const workerPath = path.join(ROOT, ".open-next", "worker.js");

if (!fs.existsSync(workerPath)) {
  console.error("❌ Missing .open-next/worker.js — run pages:build first");
  process.exit(1);
}

const source = fs.readFileSync(workerPath, "utf8");

if (source.includes("__drivoraScheduled")) {
  console.log("✓ Worker already carries the reconciliation cron handler");
  process.exit(0);
}

// Fail loudly rather than silently shipping a worker with no cron. If OpenNext
// changes the shape of its generated entry, this needs a human, not a guess.
const marker = "export default {";
const occurrences = source.split(marker).length - 1;

if (occurrences !== 1) {
  console.error(
    `❌ Expected exactly one "${marker}" in .open-next/worker.js, found ${occurrences}.\n` +
      "   OpenNext's generated entry point has changed shape — update\n" +
      "   scripts/patch-opennext-cron.mjs before deploying."
  );
  process.exit(1);
}

const patched = source.replace(marker, "const __openNextWorker = {");

const appended = `
/*
 * Reconciliation cron. Added by scripts/patch-opennext-cron.mjs.
 * Schedule lives in wrangler.jsonc under triggers.crons.
 */
async function __drivoraScheduled(event, env, ctx) {
  const secret = env.CRON_SECRET;

  if (!secret) {
    console.error("[cron] CRON_SECRET is not set — skipping reconciliation");
    return;
  }

  if (!env.WORKER_SELF_REFERENCE) {
    console.error("[cron] WORKER_SELF_REFERENCE binding missing — skipping");
    return;
  }

  const origin = env.NEXT_PUBLIC_SITE_URL || "https://drivoraparts.com";

  const run = async () => {
    try {
      const response = await env.WORKER_SELF_REFERENCE.fetch(
        new Request(\`\${origin}/api/payments/reconcile\`, {
          method: "POST",
          headers: { Authorization: \`Bearer \${secret}\` },
        })
      );

      const body = await response.text();

      if (!response.ok) {
        console.error(
          \`[cron] reconcile failed: HTTP \${response.status} \${body.slice(0, 300)}\`
        );
        return;
      }

      console.log(\`[cron] reconcile ok: \${body.slice(0, 300)}\`);
    } catch (error) {
      console.error("[cron] reconcile threw:", error && error.stack ? error.stack : error);
    }
  };

  // waitUntil keeps the isolate alive until the reconciliation finishes;
  // without it the scheduled invocation can return before the work is done.
  ctx.waitUntil(run());
}

export default {
  ...__openNextWorker,
  scheduled: __drivoraScheduled,
};
`;

fs.writeFileSync(workerPath, `${patched}${appended}`);
console.log("✓ Patched .open-next/worker.js with the reconciliation cron handler");
