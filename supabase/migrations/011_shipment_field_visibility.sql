-- Per-field visibility controls for Shipment Information, layered on top of
-- the existing shipment_details_visible master toggle (migration 010).
-- Keys: weight, shipmentType, carrier, trackingNumber, origin, destination,
-- currentLocation, estimatedDelivery. A missing key means visible=true --
-- most orders never need an explicit entry, only the ones an admin has
-- switched off. This never touches the underlying data columns (carrier,
-- tracking_number, etc.) -- it only controls what the public tracking API
-- exposes.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipment_field_visibility JSONB NOT NULL DEFAULT '{}'::jsonb;
