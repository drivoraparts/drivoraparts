import Link from "next/link";
import type { ReactNode } from "react";
import TranslatedText from "@/components/i18n/TranslatedText";
import { COMPANY_DISPLAY_NAME } from "@/lib/content/company";
import {
  CONTACT_HREF,
  DIRECT_PAYMENT_METHODS,
  ORDER_PROCESSING,
  RETURN_POLICY_HREF,
  RETURN_WINDOW_DAYS,
  SHIPPING_POLICY_HREF,
  WARRANTY_POLICY_HREF,
  listWithOr,
  shipmentType,
} from "@/lib/content/purchase-terms";
import {
  US_FREE_PARCEL_BELOW,
  classifyShipping,
  findBracket,
  US_PARCEL_RATE_TABLE,
} from "@/lib/shipping/rate-table";

/*
 * The terms of the purchase, stated once, next to the button that commits to
 * them. This replaced a grid of reassurance badges ("256-bit TLS", "Instant
 * worldwide checkout") that described the site rather than the order. Every
 * row here is either the listing's own data or a restatement of a published
 * policy -- see lib/content/purchase-terms.ts for where each comes from.
 */

type PurchaseFactsProps = {
  /** Used with freightNotes to decide the shipping label, as checkout does. */
  category: string;
  name: string;
  /** Catalog price per unit, for the single-item US shipping charge. */
  price: number;
  location?: string;
  freightNotes?: string;
  warranty?: string;
  warrantyTerms?: string;
  coreCharge?: string;
};

function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-x-3 py-3 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <dt className="pt-px text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </dt>
      <dd className="min-w-0 text-[13px] leading-relaxed text-neutral-900">{children}</dd>
    </div>
  );
}

const linkClass =
  "font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline";

/**
 * The US charge for this item ordered on its own, from the published table.
 * Undefined when the table has no bracket for the price.
 */
function singleItemUsCharge(price: number): number | undefined {
  const row = findBracket(US_PARCEL_RATE_TABLE, Math.round(price * 100));
  return row ? row.feeCents / 100 : undefined;
}

export default function PurchaseFacts({
  category,
  name,
  price,
  location,
  freightNotes,
  warranty,
  warrantyTerms,
  coreCharge,
}: PurchaseFactsProps) {
  const shipment = shipmentType(freightNotes);
  const { label } = classifyShipping({ category, name, freightNotes });
  const usCharge = label === "parcel" ? singleItemUsCharge(price) : undefined;
  // Cryptocurrency is listed last and without its provider's name: it is one
  // more option at checkout, and a product page has no reason to say who
  // processes it. It stays in the list because a customer reading "how can I
  // pay" is owed the whole answer.
  const payment = listWithOr([...DIRECT_PAYMENT_METHODS, "cryptocurrency"]);

  return (
    <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
      {/*
        The charge comes from the published US rate table (lib/shipping/
        rate-table.ts) -- the same one checkout applies and Google Merchant
        Center is configured with. Freight and multi-box items have no
        published rate yet, so they say how they are handled instead of
        showing a number nobody has set.
      */}
      <FactRow label="Shipping">
        {usCharge !== undefined ? (
          <>
            <p className="font-semibold">
              {usCharge === 0
                ? "Free standard US shipping"
                : `$${usCharge.toFixed(2)} standard US shipping`}
            </p>
            <p className="mt-0.5 text-muted">
              Charged by order subtotal from our published US rates (free on parcel
              orders under ${US_FREE_PARCEL_BELOW.toLocaleString("en-US")}) and shown
              at checkout before you order. Outside the US, shipping is confirmed
              with you before payment.{" "}
              {shipment ? `${shipment}. ` : ""}
              {location ? (
                <>
                  Ships from <TranslatedText as="span">{location}</TranslatedText>.{" "}
                </>
              ) : null}
              Typically processed within {ORDER_PROCESSING} once payment is verified.{" "}
              <Link href={SHIPPING_POLICY_HREF} prefetch={false} className={linkClass}>
                Shipping policy
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">
              {label === "parcel"
                ? "Confirmed with you before payment"
                : "Freight — confirmed with you before payment"}
            </p>
            <p className="mt-0.5 text-muted">
              {label === "parcel"
                ? "Shipping for an order of this value is quoted and confirmed with you before you pay. "
                : "This item ships as freight, which our standard US rates do not cover. The shipping charge is confirmed with you before you pay, and nothing is charged until you have seen it. "}
              {shipment ? `${shipment}. ` : ""}
              {location ? (
                <>
                  Ships from <TranslatedText as="span">{location}</TranslatedText>.{" "}
                </>
              ) : null}
              Typically processed within {ORDER_PROCESSING} once payment is verified.{" "}
              <Link href={SHIPPING_POLICY_HREF} prefetch={false} className={linkClass}>
                Shipping policy
              </Link>
            </p>
          </>
        )}
      </FactRow>

      <FactRow label="Returns">
        <p className="font-semibold">{RETURN_WINDOW_DAYS} days from delivery</p>
        <p className="mt-0.5 text-muted">
          Unused and uninstalled, in the original packaging, with authorization
          before it is sent back.{" "}
          <Link href={RETURN_POLICY_HREF} prefetch={false} className={linkClass}>
            Return policy
          </Link>
        </p>
      </FactRow>

      {/* The listing's own warranty, or a plain statement that it has none.
          Terms qualify a stated warranty, so they are shown only with one. */}
      <FactRow label="Warranty">
        {warranty ? (
          <>
            <p className="font-semibold">
              <TranslatedText as="span">{warranty}</TranslatedText>
            </p>
            <p className="mt-0.5 text-muted">
              {warrantyTerms ? (
                <>
                  <TranslatedText as="span">{warrantyTerms}</TranslatedText>{" "}
                </>
              ) : null}
              <Link href={WARRANTY_POLICY_HREF} prefetch={false} className={linkClass}>
                Warranty policy
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">None stated</p>
            <p className="mt-0.5 text-muted">
              This listing states no manufacturer or supplier warranty.{" "}
              <Link href={WARRANTY_POLICY_HREF} prefetch={false} className={linkClass}>
                Warranty policy
              </Link>
            </p>
          </>
        )}
      </FactRow>

      {coreCharge ? (
        <FactRow label="Core">
          <TranslatedText as="span">{coreCharge}</TranslatedText>
        </FactRow>
      ) : null}

      <FactRow label="Payment">
        <p>{payment}.</p>
        <p className="mt-0.5 text-muted">
          Chosen at checkout. Manual payments are confirmed by DrivoraParts
          before the order ships.
        </p>
      </FactRow>

      <FactRow label="Seller">
        <p className="font-semibold">{COMPANY_DISPLAY_NAME}</p>
        <p className="mt-0.5 text-muted">
          <Link href={CONTACT_HREF} prefetch={false} className={linkClass}>
            Contact us
          </Link>
        </p>
      </FactRow>
    </dl>
  );
}
