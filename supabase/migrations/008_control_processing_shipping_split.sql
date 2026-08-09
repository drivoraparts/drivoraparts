-- Splits the old single "Order Status" (order_status) into two genuinely
-- separate layers, per an explicit follow-up request:
--
--   control_status  -- coarse admin control: Active / On Hold / Cancelled /
--                       Completed / Refunded. Can change at any point
--                       without losing processing or shipping progress.
--   order_status    -- now ONLY the pre-shipping processing pipeline:
--                       Order Received -> Processing -> Preparing Order ->
--                       Order Verification -> Ready for Shipment ->
--                       Processing Complete. "Payment Confirmed" is
--                       deliberately NOT a value here -- it's derived
--                       read-only from the real payments table so it can
--                       never be set by clicking through this list.
--
-- shipping_status is untouched -- it already had its own independent
-- lifecycle and stays that way.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS control_status TEXT NOT NULL DEFAULT 'active';

-- Backfill control_status from the OLD order_status vocabulary before that
-- column's values get remapped below.
UPDATE orders SET control_status = CASE order_status
  WHEN 'on_hold' THEN 'on_hold'
  WHEN 'cancelled' THEN 'cancelled'
  WHEN 'refunded' THEN 'refunded'
  WHEN 'completed' THEN 'completed'
  ELSE 'active'
END;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_control_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_control_status_check
  CHECK (control_status IN ('active', 'on_hold', 'cancelled', 'completed', 'refunded'));

-- Now remap order_status itself to the new processing-only vocabulary.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;

UPDATE orders SET order_status = CASE order_status
  WHEN 'pending' THEN 'order_received'
  WHEN 'confirmed' THEN 'processing'
  WHEN 'processing' THEN 'processing'
  WHEN 'on_hold' THEN 'processing'
  WHEN 'ready_for_shipment' THEN 'ready_for_shipment'
  WHEN 'shipped' THEN 'processing_complete'
  WHEN 'completed' THEN 'processing_complete'
  WHEN 'cancelled' THEN 'processing'
  WHEN 'refunded' THEN 'processing'
  ELSE 'order_received'
END;

ALTER TABLE orders ALTER COLUMN order_status SET DEFAULT 'order_received';

ALTER TABLE orders
  ADD CONSTRAINT orders_order_status_check
  CHECK (order_status IN (
    'order_received',
    'processing',
    'preparing_order',
    'verification',
    'ready_for_shipment',
    'processing_complete'
  ));

ALTER TABLE order_events DROP CONSTRAINT IF EXISTS order_events_event_type_check;
ALTER TABLE order_events
  ADD CONSTRAINT order_events_event_type_check
  CHECK (event_type IN (
    'payment_status',
    'control_status',
    'order_status',
    'shipping_status',
    'shipment_hold',
    'note'
  ));
