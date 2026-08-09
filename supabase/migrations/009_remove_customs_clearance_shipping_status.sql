-- Removes "Customs Clearance" as a normal Shipping Status value.
--
-- Customs isn't a sequential milestone every shipment passes through in the
-- same place -- it can happen (or not happen) at almost any point in the
-- journey. Representing it as a normal status forced the shipping sequence
-- to look like Shipped -> In Transit -> Customs Clearance -> Arrived, which
-- was misleading for shipments that never went through customs at all.
--
-- Customs is now represented exclusively through the existing Shipment Hold
-- overlay (shipping_hold_reason = 'customs_clearance'), which can be placed
-- on top of whichever shipping status is currently active without changing
-- that status.

-- Backfill: the old customs_clearance value only ever meant "somewhere in
-- transit, held for customs" -- in_transit is the closest real point in the
-- sequential journey for any order still sitting on that old value.
UPDATE orders SET shipping_status = 'in_transit' WHERE shipping_status = 'customs_clearance';

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_shipping_status_check
  CHECK (shipping_status IN (
    'not_shipped',
    'preparing_shipment',
    'shipped',
    'in_transit',
    'arrived_at_destination',
    'out_for_delivery',
    'delivery_exception',
    'delivered'
  ));
