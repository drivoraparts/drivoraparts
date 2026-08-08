-- Order lifecycle tracking: separate Payment / Order / Shipping status
-- dimensions, a public order reference, admin shipping fields, and a
-- timeline of status-change events.
--
-- IMPORTANT: `orders.status` is left completely untouched (same column,
-- same allowed values, same meaning) -- it's load-bearing for revenue
-- stats (getOrderStats), review-purchase verification (hasCompletedPurchase),
-- "placed order" filtering (isPlacedOrder), and the payment webhook's
-- idempotent finalizeOrderPaid()/failOrderIfUnpaid() compare-and-set logic.
-- Rewriting its vocabulary would silently break all of that. Instead this
-- adds a NEW `order_status` column carrying the richer admin-facing
-- lifecycle (pending/confirmed/processing/on_hold/ready_for_shipment/
-- shipped/completed/cancelled/refunded), kept in sync with `status` at the
-- moments that matter (order creation, payment confirmation) without ever
-- replacing it.

-- Payment status: extend with intermediate/edge states the admin needs to
-- see and set (processing, expired, partially_refunded). Existing values
-- (pending/paid/failed/refunded) are unchanged.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN (
    'pending',
    'processing',
    'paid',
    'failed',
    'expired',
    'refunded',
    'partially_refunded'
  ));

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number TEXT,
  ADD COLUMN IF NOT EXISTS order_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS shipping_status TEXT NOT NULL DEFAULT 'not_shipped',
  ADD COLUMN IF NOT EXISTS carrier TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS shipment_origin TEXT,
  ADD COLUMN IF NOT EXISTS shipment_destination TEXT,
  ADD COLUMN IF NOT EXISTS shipment_reference TEXT,
  ADD COLUMN IF NOT EXISTS shipment_notes TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_start DATE,
  ADD COLUMN IF NOT EXISTS estimated_delivery_end DATE,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_order_status_check
  CHECK (order_status IN (
    'pending',
    'confirmed',
    'processing',
    'on_hold',
    'ready_for_shipment',
    'shipped',
    'completed',
    'cancelled',
    'refunded'
  ));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_shipping_status_check
  CHECK (shipping_status IN (
    'not_shipped',
    'preparing_shipment',
    'shipped',
    'in_transit',
    'customs_clearance',
    'arrived_at_destination',
    'out_for_delivery',
    'delivered',
    'delivery_exception'
  ));

-- Backfill order_status for existing rows from the legacy `status` column
-- so history isn't lost, then make order_number required going forward.
UPDATE orders SET order_status = CASE status
  WHEN 'pending' THEN 'pending'
  WHEN 'processing' THEN 'processing'
  WHEN 'paid' THEN 'confirmed'
  WHEN 'failed' THEN 'cancelled'
  WHEN 'shipped' THEN 'shipped'
  WHEN 'delivered' THEN 'completed'
  WHEN 'cancelled' THEN 'cancelled'
  WHEN 'refunded' THEN 'refunded'
  ELSE 'pending'
END
WHERE order_status = 'pending';

UPDATE orders SET shipping_status = 'delivered' WHERE status = 'delivered' AND shipping_status = 'not_shipped';
UPDATE orders SET shipping_status = 'shipped' WHERE status = 'shipped' AND shipping_status = 'not_shipped';

-- Backfill a short public reference for existing rows (format DRV-XXXXXXX,
-- derived from the row's own uuid so it's deterministic and needs no loop).
UPDATE orders
  SET order_number = 'DRV-' || upper(substr(replace(id::text, '-', ''), 1, 7))
  WHERE order_number IS NULL;

ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON orders (shipping_status);

-- Timeline: every payment/order/shipping status change, admin or system.
CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('payment_status', 'order_status', 'shipping_status', 'note')),
  from_value TEXT,
  to_value TEXT,
  note TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  customer_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events (order_id, created_at);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
