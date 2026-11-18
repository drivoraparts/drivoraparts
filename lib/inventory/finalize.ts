import type { Product } from "./types";
import { applyMileageRules } from "./condition";
import { applyFulfillmentWording } from "./fulfillment";
import { applyPublicPrices } from "./pricing";
import { applyProductMediaOverrides } from "./apply-media-overrides";
import { applyAdminCatalog } from "./apply-admin-catalog";

/**
 * The storefront transforms, applied to raw listing records: media
 * overrides, admin edits and additions, mileage and fulfilment wording, and
 * public prices. Shared by the deployed catalog (products.ts, from the
 * snapshot) and the full source catalog (full-catalog.ts, used by scripts),
 * so a listing reads the same in both.
 */
export function finalizeCatalog(raw: Product[]): Product[] {
  return applyPublicPrices(
    applyFulfillmentWording(applyMileageRules(applyAdminCatalog(applyProductMediaOverrides(raw))))
  );
}
