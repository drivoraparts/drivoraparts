import Link from "next/link";
import type { ReactNode } from "react";
import TranslatedText from "@/components/i18n/TranslatedText";
import { COMPANY_LEGAL_NAME, US_HEADQUARTERS } from "@/lib/content/company";
import {
  CONTACT_HREF,
  DIRECT_PAYMENT_METHODS,
  ORDER_PROCESSING,
  RETURN_POLICY_HREF,
  RETURN_WINDOW_DAYS,
  listWithOr,
  shipmentType,
} from "@/lib/content/purchase-terms";

/*
 * The terms of the purchase, stated once, next to the button that commits to
 * them. This replaced a grid of reassurance badges ("256-bit TLS", "Instant
 * worldwide checkout") that described the site rather than the order. Every
 * row here is either the listing's own data or a restatement of a published
 * policy -- see lib/content/purchase-terms.ts for where each comes from.
 */

type PurchaseFactsProps = {
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

export default function PurchaseFacts({
  location,
  freightNotes,
  warranty,
  warrantyTerms,
  coreCharge,
}: PurchaseFactsProps) {
  const shipment = shipmentType(freightNotes);
  const payment = listWithOr([...DIRECT_PAYMENT_METHODS, "cryptocurrency (NOWPayments)"]);

  return (
    <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
      <FactRow label="Shipping">
        <p className="font-semibold">Free standard shipping</p>
        <p className="mt-0.5 text-muted">
          {shipment ? `${shipment}. ` : ""}
          {location ? (
            <>
              Ships from <TranslatedText as="span">{location}</TranslatedText>.{" "}
            </>
          ) : null}
          Typically processed within {ORDER_PROCESSING} once payment is verified.
        </p>
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

      {warranty ? (
        <FactRow label="Warranty">
          <p className="font-semibold">
            <TranslatedText as="span">{warranty}</TranslatedText>
          </p>
          {warrantyTerms ? (
            <p className="mt-0.5 text-muted">
              <TranslatedText as="span">{warrantyTerms}</TranslatedText>
            </p>
          ) : null}
        </FactRow>
      ) : null}

      {coreCharge ? (
        <FactRow label="Core">
          <TranslatedText as="span">{coreCharge}</TranslatedText>
        </FactRow>
      ) : null}

      <FactRow label="Payment">
        <p>{payment}.</p>
        <p className="mt-0.5 text-muted">
          Chosen at checkout. Direct payments are confirmed by DrivoraParts
          before the order ships.
        </p>
      </FactRow>

      <FactRow label="Seller">
        <p className="font-semibold">{COMPANY_LEGAL_NAME}</p>
        <p className="mt-0.5 text-muted">
          {US_HEADQUARTERS.city}, {US_HEADQUARTERS.stateName} ·{" "}
          <Link href={CONTACT_HREF} prefetch={false} className={linkClass}>
            Contact us
          </Link>
        </p>
      </FactRow>
    </dl>
  );
}
