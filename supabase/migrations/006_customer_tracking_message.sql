-- Admin-authored, customer-visible tracking message -- separate from
-- shipment_notes (internal-only, migration 005) and from the order_events
-- timeline. Lets an admin post a short human status note (e.g. "Your order
-- is currently in transit and expected to arrive soon.") independent of the
-- structured status fields, per the fully-manual, admin-is-source-of-truth
-- tracking model. No third-party carrier integration reads or writes this.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_message TEXT,
  ADD COLUMN IF NOT EXISTS customer_message_updated_at TIMESTAMPTZ;
