-- Add failed order status for payment lifecycle
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',
    'processing',
    'paid',
    'failed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ));
