import Link from "next/link";
import { routes } from "@/lib/inventory";

/**
 * Shown on the URL of a listing that is no longer on the storefront.
 *
 * DrivoraParts now lists Toyota parts only. Listings for other makes, and
 * listings whose Toyota fitment is not yet confirmed, are hidden rather than
 * deleted (see lib/inventory/toyota-visibility.ts), so an old link, a
 * bookmark or an order email still lands somewhere that explains itself.
 * The page is not indexed and offers nothing to buy.
 */
export default function UnavailableListing({ name }: { name: string }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-red,#EB0A1E)]">
        No longer listed
      </p>
      <h1 className="mt-4 text-2xl font-bold text-[#17191C] sm:text-3xl">{name}</h1>
      <p className="mt-4 text-base leading-relaxed text-[#69717C]">
        This part is no longer available on DrivoraParts. We now specialize in
        parts for Toyota vehicles. If you placed an order for this item, it is
        unaffected; you can check it on the order tracking page.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={routes.all}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#17191C] px-6 text-sm font-semibold text-white hover:bg-black"
        >
          Shop Toyota parts
        </Link>
        <Link
          href="/track-order"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#E5E7EB] px-6 text-sm font-semibold text-[#17191C] hover:border-[#17191C]"
        >
          Track an order
        </Link>
      </div>
    </main>
  );
}
