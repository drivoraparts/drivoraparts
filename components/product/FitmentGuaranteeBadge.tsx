"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";
import {
  FITMENT_GUARANTEE_BADGE,
  FITMENT_GUARANTEE_DETAIL,
  FITMENT_GUARANTEE_HREF,
  FITMENT_GUARANTEE_SUBLINE,
  FITMENT_GUARANTEE_VIN_LINE,
  FITMENT_VIN_CHECK_HREF,
} from "@/lib/content/fitment-guarantee";

/*
 * "Fitment Guaranteed", directly above Add to Cart. A native <details>: no
 * JavaScript needed to open it, keyboard and screen-reader accessible, and it
 * does not move Add to Cart until the shopper chooses to read it.
 * Styling: components/product/fitment-guarantee.css (green, flat, one bold
 * left edge; no shadow, no gradient).
 */
export default function FitmentGuaranteeBadge({ productId }: { productId: number }) {
  return (
    <details
      className="fg-badge"
      onToggle={(event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) {
          trackEvent("fitment_guarantee_open", { productId });
        }
      }}
    >
      <summary>
        <svg className="fg-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" strokeLinejoin="round" />
          <path d="M8.5 12.2l2.4 2.4 4.6-4.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="min-w-0">
          <span className="fg-title block">{FITMENT_GUARANTEE_BADGE}</span>
          <span className="fg-sub block">{FITMENT_GUARANTEE_SUBLINE}</span>
        </span>
        <svg className="fg-chevron" viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="fg-body">
        <p>{FITMENT_GUARANTEE_DETAIL}</p>
        <p className="mt-2">{FITMENT_GUARANTEE_VIN_LINE}</p>
        <div className="fg-links">
          <Link
            href={FITMENT_VIN_CHECK_HREF}
            prefetch={false}
            onClick={() => trackEvent("fitment_vin_check_click", { productId })}
          >
            Check my VIN →
          </Link>
          <Link href={FITMENT_GUARANTEE_HREF} prefetch={false}>
            Read the guarantee →
          </Link>
        </div>
      </div>
    </details>
  );
}
