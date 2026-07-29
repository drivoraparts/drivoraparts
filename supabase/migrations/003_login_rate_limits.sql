-- Durable admin-login rate limiting. The previous limiter kept counters in
-- per-isolate in-memory state, which Cloudflare Workers resets independently
-- per edge location/isolate — an attacker spreading login attempts across
-- edge locations faced effectively no limit. This table gives every isolate
-- a shared view of attempt counts.
CREATE TABLE IF NOT EXISTS login_rate_limits (
  key TEXT PRIMARY KEY,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
