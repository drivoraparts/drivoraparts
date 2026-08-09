-- Lets an admin hide the "Shipment Details" section on the customer
-- tracking page for a specific order without touching any of the
-- underlying carrier/tracking/origin/destination data. Defaults to visible
-- so every existing order keeps its current behavior.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_details_visible BOOLEAN NOT NULL DEFAULT true;
