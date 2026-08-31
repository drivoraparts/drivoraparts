-- Provenance for reviews collected outside the website.
--
-- Most DrivoraParts sales so far happened over WhatsApp, Instagram and in
-- person, so the customers who could vouch for the shop never had a way to
-- leave a review on it. This lets an admin transcribe what a real customer
-- actually said.
--
-- That is only defensible if the record says where the words came from and who
-- entered them. A review typed by staff with no provenance is indistinguishable
-- from an invented one -- these columns are what keeps the two apart, and the
-- product page shows the source next to the review.
--
-- verified_purchase is deliberately NOT touched here. It stays derived from a
-- real completed order (lib/db/orders.ts:hasCompletedPurchase) and can never be
-- set by hand, whichever way the review arrived.

ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'storefront'
    CHECK (source IN (
      'storefront',
      'whatsapp',
      'instagram',
      'facebook',
      'email',
      'in_person',
      'other'
    ));

-- Admin email for anything not submitted by the customer themselves. Null for
-- storefront reviews, which nobody typed on a customer's behalf.
ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS entered_by TEXT;

-- When the customer actually said it, which is not when it was typed in.
-- Falls back to created_at when unknown.
ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ;

-- Moderation lists filter by provenance to review transcribed entries closely.
CREATE INDEX IF NOT EXISTS idx_product_reviews_source
  ON product_reviews (source, created_at DESC);
