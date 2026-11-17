-- Verified reviews, step 2: review requests and structured answers.
--
-- A review earns Verified Buyer only through a single-use link emailed to the
-- order's own address after delivery (lib/reviews/requests.ts). Knowing a
-- buyer's email address is not enough; receiving mail at it is.
--
-- review_requests: one row per delivered order item. The link token carries
--   only this row's id, signed with AUTH_SECRET; everything else is read here.
-- review_email_optouts: customers who asked for no more review requests,
--   keyed by a keyed hash of their email (no plain address stored).
-- product_reviews gains the order item it was written for (UNIQUE: one review
--   per purchased item) and the per-category answers.
--
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL UNIQUE REFERENCES order_items (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  email_hash TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL,
  -- When the request should go out: delivery plus a wait that depends on the
  -- part (a headlight is judged in a week, an engine after it is installed).
  due_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  review_id UUID REFERENCES product_reviews (id) ON DELETE SET NULL,
  -- Set instead of sending: 'opted_out', 'order_cancelled', 'not_listed', ...
  skipped_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_requests_due
  ON review_requests (due_at)
  WHERE sent_at IS NULL AND skipped_reason IS NULL;

CREATE INDEX IF NOT EXISTS idx_review_requests_order ON review_requests (order_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_email ON review_requests (email_hash);

CREATE TABLE IF NOT EXISTS review_email_optouts (
  email_hash TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_email_optouts ENABLE ROW LEVEL SECURITY;

ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS order_item_id UUID REFERENCES order_items (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verification_method TEXT,
  ADD COLUMN IF NOT EXISTS answers JSONB,
  ADD COLUMN IF NOT EXISTS answers_schema TEXT,
  ADD COLUMN IF NOT EXISTS vehicle TEXT,
  ADD COLUMN IF NOT EXISTS installed_by TEXT,
  ADD COLUMN IF NOT EXISTS would_buy_again BOOLEAN;

-- One review per purchased item. Partial so the many reviews with no order
-- item (transcribed, legacy) are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_reviews_order_item
  ON product_reviews (order_item_id)
  WHERE order_item_id IS NOT NULL;
