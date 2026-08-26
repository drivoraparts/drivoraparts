-- Product reviews.
--
-- Reviews previously lived in a module-level array. On Workers each request can
-- land in a fresh isolate, so a review a customer submitted was gone by the
-- next page load. That went unnoticed while a generator refilled the array on
-- every cold start; removing the fabricated reviews exposed it.
--
-- product_id is the catalog id (a plain integer in lib/inventory), not a
-- foreign key -- the catalog lives in the repository, not the database.

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT NOT NULL,
  -- Set from a real completed-order lookup, never from anything the reviewer
  -- submitted about themselves.
  verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  profile_image TEXT,
  status TEXT NOT NULL DEFAULT 'approved'
    CHECK (status IN ('approved', 'hidden', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The product page reads approved reviews for one product, newest first.
CREATE INDEX IF NOT EXISTS idx_product_reviews_product
  ON product_reviews (product_id, status, created_at DESC);

-- Admin moderation lists by recency across all products.
CREATE INDEX IF NOT EXISTS idx_product_reviews_created
  ON product_reviews (created_at DESC);
