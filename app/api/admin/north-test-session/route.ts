import { requireAdminApi } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY — delete this file once North sandbox certification is through.
 *
 * North requires one real sandbox transaction before it will certify the
 * checkout. Creating the session for that transaction has to happen
 * server-side: North's own docs keep the private key off the client, and its
 * Radware WAF refused the call from a browser and from a developer shell. This
 * route makes the call from the Worker, which is exactly where North expects it
 * to come from, and serves the resulting checkout form on this origin so the
 * test card can be entered by a person.
 *
 * Locked behind the admin login twice over: middleware already enforces the
 * admin session on every /api/admin/* path, and requireAdminApi() checks it
 * again here so removing a middleware rule could never expose it. It spends the
 * North key on every hit, so it must never be reachable anonymously.
 *
 * The private key is read from the NORTH_PRIVATE_KEY Worker secret and never
 * leaves the server. Only the short-lived session token reaches the browser.
 * Sandbox only: the checkout and profile below are the sandbox checkout, and
 * the test card moves no money.
 */

const NORTH_SESSIONS_URL = "https://checkout.north.com/api/sessions";
const CHECKOUT_ID = "d5cfaa7b-e92e-4c13-8728-97e717c419dd";
const PROFILE_ID = "62c4804d-f3f4-46f6-a15a-023da89d2374";
const TEST_AMOUNT = 19.99;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Safe to drop inside a <script>: JSON quoting plus no way to close the tag.
const jsString = (value: string) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

function page(title: string, body: string, status = 200): Response {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 560px; margin: 32px auto; padding: 0 16px; color: #111; }
    .note { background: #fff8e1; border: 1px solid #f0d67a; border-radius: 8px; padding: 12px 14px; font-size: 14px; line-height: 1.5; }
    .err { background: #fdecea; border: 1px solid #f5b5ad; border-radius: 8px; padding: 12px 14px; font-size: 14px; line-height: 1.5; }
    code, pre { background: #f2f2f2; border-radius: 4px; }
    code { padding: 1px 5px; }
    pre { padding: 10px; white-space: pre-wrap; word-break: break-all; font-size: 12px; }
    #status { margin-top: 12px; font-size: 13px; color: #555; white-space: pre-wrap; }
    #checkout-container { margin-top: 20px; min-height: 420px; }
  </style>
</head>
<body>
  <h1 style="font-size:20px">${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  const rawKey = process.env.NORTH_PRIVATE_KEY;
  if (!rawKey) {
    return page(
      "North sandbox — key not configured",
      `<div class="err">The <code>NORTH_PRIVATE_KEY</code> Worker secret is not set.
      Run <code>npx wrangler secret put NORTH_PRIVATE_KEY</code>, paste the key when
      prompted, then reload this page.</div>`,
      500
    );
  }

  // A trailing newline from `wrangler secret put` is the usual reason a key
  // that looks right is rejected -- North receives 65 characters and matches
  // none. Trim before sending. The shape is reported below (length, charset,
  // whitespace -- never the key) so a wrong key can be told from a mangled one.
  const key = rawKey.trim();
  const keyShape =
    `length ${rawKey.length}` +
    (rawKey.length !== key.length ? ` (trimmed to ${key.length} -- had surrounding whitespace)` : "") +
    ` · ${/^[0-9a-f]+$/i.test(key) ? "hex" : "NOT plain hex"}` +
    ` · expected 64 hex chars`;

  let upstream: Response;
  try {
    upstream = await fetch(NORTH_SESSIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        // North's integration guide requires this string in the User-Agent.
        "User-Agent": "Embedded Checkout",
      },
      body: JSON.stringify({
        checkoutId: CHECKOUT_ID,
        profileId: PROFILE_ID,
        amount: TEST_AMOUNT,
      }),
    });
  } catch (error) {
    return page(
      "North sandbox — could not reach North",
      `<div class="err">The request to North failed before a response came back:
      <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre></div>`,
      502
    );
  }

  const raw = await upstream.text();

  if (!upstream.ok) {
    // Show exactly what North said -- the status and server header are what
    // distinguish a Radware block ("rdwr", HTML page) from an API error (JSON).
    return page(
      `North sandbox — session refused (HTTP ${upstream.status})`,
      `<div class="err">North did not create a session.<br />
      HTTP <strong>${upstream.status}</strong> · Server:
      <code>${escapeHtml(upstream.headers.get("server") ?? "unknown")}</code>
      <pre>${escapeHtml(raw.slice(0, 1500))}</pre>
      <p style="font-size:13px;margin:8px 0 0">Stored key shape:
      <code>${escapeHtml(keyShape)}</code></p></div>`,
      502
    );
  }

  let token: string | null = null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const candidate = data.token ?? data.sessionToken ?? data.session_token;
    token = typeof candidate === "string" && candidate ? candidate : null;
  } catch {
    token = null;
  }

  if (!token) {
    return page(
      "North sandbox — no token in response",
      `<div class="err">North answered HTTP ${upstream.status} but no token was found in
      the response:<pre>${escapeHtml(raw.slice(0, 1500))}</pre></div>`,
      502
    );
  }

  return page(
    "North sandbox — test transaction",
    `<div class="note"><strong>SANDBOX ONLY.</strong> Enter the test card
    <code>4111 1111 1111 1111</code>, expiry <code>12/30</code>, CVV <code>123</code>,
    ZIP <code>12345</code>, then submit. Amount: $${TEST_AMOUNT.toFixed(2)}. No real money moves.
    Reloading this page creates a new session.</div>
    <div id="status">Session created. Loading North's checkout form…</div>
    <div id="checkout-container"></div>
    <script>
      (function () {
        var token = ${jsString(token)};
        var status = document.getElementById("status");
        function log(m) { status.textContent += "\\n" + m; }

        // Snapshot globals before loading, so we can name exactly what
        // checkout.js adds -- the earlier probe only looked for a fixed set of
        // names and reported nothing, which does not distinguish "script did
        // not load" from "script loaded under a name I did not guess".
        var before = {};
        Object.keys(window).forEach(function (k) { before[k] = true; });

        function tryMount(api, label) {
          var fn = api && (api.mount || api.render || api.init || api.create);
          if (typeof fn !== "function") return false;
          log("Using " + label + "." + (api.mount ? "mount" : api.render ? "render" : api.init ? "init" : "create") + "().");
          try {
            Promise.resolve(fn.call(api, token, "checkout-container"))
              .then(function () { log("Form mounted. Enter the test card and submit."); })
              .catch(function (e) { log("mount failed: " + (e && e.message ? e.message : e)); });
          } catch (e) {
            log("mount threw: " + (e && e.message ? e.message : e));
          }
          return true;
        }

        var s = document.createElement("script");
        s.src = "https://checkout.north.com/checkout.js";
        s.onerror = function () {
          log("checkout.js FAILED to load. The browser was blocked from fetching it " +
              "(WAF/Radware 403, or a network refusal) -- the same wall the server hit. " +
              "North's embedded script is not reachable from the browser either, so this " +
              "needs North support: ask them to allow checkout.js and the sandbox origin " +
              "for drivoraparts.com.");
        };
        s.onload = function () {
          var added = Object.keys(window).filter(function (k) { return !before[k]; });
          // Anything new that carries a mount-like function is the SDK entry point.
          var entry = null, entryName = "";
          added.concat(["checkout", "Checkout", "North", "NorthCheckout"]).some(function (k) {
            var v = window[k];
            if (v && (typeof v.mount === "function" || typeof v.render === "function" ||
                      typeof v.init === "function" || typeof v.create === "function")) {
              entry = v; entryName = k; return true;
            }
            return false;
          });
          if (entry) { tryMount(entry, entryName); return; }
          log("checkout.js loaded but exposed no mount()/render()/init()/create().");
          log("New globals it added: " + (added.length ? added.join(", ") : "(none)"));
          log("If this list is empty, the file loaded as an empty/blocked response. " +
              "Send this to North support with the checkout ID.");
        };
        document.head.appendChild(s);
      })();
    </script>`
  );
}
