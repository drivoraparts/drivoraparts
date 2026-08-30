-- Records which shipping option the customer chose, alongside the fee that
-- was already stored in orders.shipping.
--
-- Existing orders predate the choice and are backfilled to 'standard', which
-- is accurate: standard shipping was the only option, and every one of them
-- has shipping = 0.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_method text NOT NULL DEFAULT 'standard',
  -- The freight class the express price was based on. Stored so the dashboard
  -- can show how a shipment was priced without recomputing it from a catalog
  -- that may have changed since the order was placed.
  ADD COLUMN IF NOT EXISTS shipment_freight_class text,
  ADD COLUMN IF NOT EXISTS shipment_zone text;

-- Guard against a typo writing a method the app does not understand.
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_shipping_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_shipping_method_check
  CHECK (shipping_method IN ('standard', 'express'));

UPDATE orders SET shipping_method = 'standard' WHERE shipping_method IS NULL;

COMMENT ON COLUMN orders.shipping_method IS
  'standard (free) or express (priced from lib/shipping/config.ts at order time)';
COMMENT ON COLUMN orders.shipment_freight_class IS
  'parcel | multibox | pallet — the class the express fee was calculated from';
COMMENT ON COLUMN orders.shipment_zone IS
  'us | ca | uk-eu | au-nz | rest — destination zone at order time';
