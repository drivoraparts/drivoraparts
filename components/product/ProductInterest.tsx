import type { ProductInterest as Interest } from "@/lib/analytics/product-interest";

/**
 * Real interest in a product, in place of a rating it has not earned yet.
 *
 * Every number here is counted from actual visitor events. Nothing is
 * estimated, rounded up, or invented — if a listing is quiet, the component
 * renders nothing rather than dressing up a small number.
 */
export default function ProductInterest({
  interest,
}: {
  interest: Interest | null;
}) {
  if (!interest) return null;

  const { views, cartAdds, windowDays } = interest;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-sm border border-neutral-200 bg-neutral-50 px-3.5 py-2.5">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-3.5 w-3.5 shrink-0 text-neutral-500"
          aria-hidden="true"
        >
          <path
            d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="10" r="2.5" />
        </svg>
        {views.toLocaleString()} people viewed this in the last {windowDays} days
      </span>

      {cartAdds > 0 ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
          <span aria-hidden className="h-1 w-1 rounded-full bg-neutral-300" />
          {cartAdds.toLocaleString()} added it to their cart
        </span>
      ) : null}
    </div>
  );
}
