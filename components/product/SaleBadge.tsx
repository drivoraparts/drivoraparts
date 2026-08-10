/** Shown on any product whose real price is below its compare-at price --
 * same "on sale" condition ProductPrice already uses to decide whether to
 * render a struck-through compare price. Gradient + shape are deliberately
 * distinct from the flat solid-color NEW/discount badges elsewhere on the
 * card so it doesn't blend into them when both are present. */
export default function SaleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-[9px] ${className}`}
    >
      On Sale
    </span>
  );
}

export function isProductOnSale(price: number, compareAtPrice?: number | null): boolean {
  return compareAtPrice != null && compareAtPrice > price && compareAtPrice > 0;
}
