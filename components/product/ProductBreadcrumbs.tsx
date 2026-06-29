import Link from "next/link";
import { routes } from "@/lib/inventory";

type ProductBreadcrumbsProps = {
  categoryName: string;
  categorySlug: string;
  productName: string;
};

export default function ProductBreadcrumbs({
  categoryName,
  categorySlug,
  productName,
}: ProductBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-neutral-300 bg-[#e5e7eb] px-4 py-3 sm:px-6"
    >
      <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
        <li>
          <Link href={routes.catalog} className="transition hover:text-neutral-900">
            Catalog
          </Link>
        </li>
        <li aria-hidden="true" className="text-neutral-300">
          /
        </li>
        <li>
          <Link
            href={routes.category(categorySlug)}
            className="transition hover:text-neutral-900"
          >
            {categoryName}
          </Link>
        </li>
        <li aria-hidden="true" className="text-neutral-300">
          /
        </li>
        <li className="line-clamp-1 text-neutral-800">{productName}</li>
      </ol>
    </nav>
  );
}
