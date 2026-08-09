-- Shipment hold/clearance system + a few additional real shipment-detail
-- fields (shipment type, manually-assigned current location). Hold is
-- modeled as a flag layered on top of the existing `shipping_status`
-- column rather than another enum value: shipping_status keeps recording
-- where the shipment actually is (Shipped / In Transit / etc.), and the
-- hold flag independently says "movement is paused right now" without
-- losing that underlying stage -- so resuming doesn't require guessing
-- what status to snap back to.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipment_type TEXT,
  ADD COLUMN IF NOT EXISTS shipment_current_location TEXT,
  ADD COLUMN IF NOT EXISTS shipment_current_location_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipping_hold_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shipping_hold_reason TEXT,
  ADD COLUMN IF NOT EXISTS shipping_hold_note TEXT,
  ADD COLUMN IF NOT EXISTS shipping_hold_updated_at TIMESTAMPTZ;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_hold_reason_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_shipping_hold_reason_check
  CHECK (shipping_hold_reason IS NULL OR shipping_hold_reason IN (
    'customs_clearance',
    'documentation_required',
    'customs_inspection',
    'documentation_review',
    'address_verification',
    'carrier_delay',
    'other'
  ));

-- Dedicated timeline event type for hold placed / resumed, distinct from a
-- plain internal "note" so the customer-facing timeline can render it with
-- its own label instead of a generic note.
ALTER TABLE order_events DROP CONSTRAINT IF EXISTS order_events_event_type_check;
ALTER TABLE order_events
  ADD CONSTRAINT order_events_event_type_check
  CHECK (event_type IN ('payment_status', 'order_status', 'shipping_status', 'shipment_hold', 'note'));
