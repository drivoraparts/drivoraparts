-- Records where an order's shipping figure came from.
--
--   us_price_table  calculated at checkout from the published US rate table
--                   (lib/shipping/rates.ts). orders.shipping = 0 means FREE.
--   manual_quote    not yet quoted; orders.shipping = 0 means NOT CALCULATED,
--                   and an admin quotes it before the customer pays.
--
-- Existing orders are left NULL, which every reader treats as manual_quote:
-- each of them was placed when shipping was always quoted by hand.
--
-- The app writes this column only while it exists (see createOrderRecord), so
-- deploying the code before running this migration does not break checkout.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_basis text;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_shipping_basis_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_shipping_basis_check
  CHECK (shipping_basis IS NULL OR shipping_basis IN ('us_price_table', 'manual_quote'));

COMMENT ON COLUMN orders.shipping_basis IS
  'us_price_table (calculated at checkout; 0 = free) | manual_quote (to be quoted) | NULL (pre-015, manual)';
