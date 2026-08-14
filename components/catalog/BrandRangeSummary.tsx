import Link from "next/link";
import { routes } from "@/lib/inventory";

type SummaryProduct = {
  price?: number;
  condition?: string;
};

type BrandRangeSummaryProps = {
  brandName: string;
  categoryName: string;
  categorySlug: string;
  products: SummaryProduct[];
  /** Other brands stocked in the same category, for crawlable sibling links. */
  siblings: { slug: string; name: string }[];
};

const CONDITION_LABELS: Record<string, string> = {
  "brand-new": "brand new",
  used: "used",
  refurbished: "refurbished",
  "aftermarket-used": "aftermarket used",
  "aftermarket-mixed": "aftermarket",
};

function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/**
 * Everything here is read off the listings themselves — count, price span,
 * condition mix, sibling brands. Brand pages were previously a heading, one
 * sentence and a grid, which left them thin for the searches they should win
 * ("BMW turbochargers"), so this adds substance without inventing claims about
 * parts we hold no data for.
 */
export default function BrandRangeSummary({
  brandName,
  categoryName,
  categorySlug,
  products,
  siblings,
}: BrandRangeSummaryProps) {
  const prices = products
    .map((p) => p.price)
    .filter((p): p is number => typeof p === "number" && p > 0);
  const low = prices.length ? Math.min(...prices) : null;
  const high = prices.length ? Math.max(...prices) : null;

  const conditions = [
    ...new Set(
      products
        .map((p) => (p.condition ? CONDITION_LABELS[p.condition] ?? p.condition : null))
        .filter((c): c is string => Boolean(c))
    ),
  ];

  const category = categoryName.toLowerCase();
  const count = products.length;

  const facts: string[] = [
    `${count} ${brandName} ${category} listing${count === 1 ? "" : "s"} in stock`,
  ];
  if (low !== null && high !== null) {
    facts.push(low === high ? formatUsd(low) : `${formatUsd(low)} – ${formatUsd(high)}`);
  }
  if (conditions.length) {
    facts.push(`condition: ${conditions.join(", ")}`);
  }

  return (
    <section className="mb-8 max-w-3xl" aria-label={`About ${brandName} ${category}`}>
      <ul className="mb-4 flex flex-wrap gap-x-2 gap-y-1 text-xs text-neutral-600">
        {facts.map((fact, index) => (
          <li key={fact} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden className="text-neutral-300">·</span> : null}
            <span>{fact}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm leading-relaxed text-neutral-600">
        Every {brandName} {category} listing on DrivoraParts is checked for
        correct photos and specifications before it goes live, ships worldwide
        with freight arranged on heavy assemblies, and is covered by the
        warranty stated on the product page.{" "}
        <Link
          href={routes.category(categorySlug)}
          className="font-medium text-red-600 underline-offset-2 hover:underline"
        >
          See the full {categoryName} range
        </Link>
        .
      </p>

      {siblings.length > 0 ? (
        <nav className="mt-5" aria-label={`Other ${category} brands`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Other {category} brands
          </p>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((sibling) => (
              <li key={sibling.slug}>
                <Link
                  href={routes.brand(categorySlug, sibling.slug)}
                  className="inline-block rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 transition hover:border-red-300 hover:text-red-700"
                >
                  {sibling.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}
