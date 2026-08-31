import Link from "next/link";
import ScrollReveal from "@/components/home/ScrollReveal";
import ProductPrice from "@/components/currency/ProductPrice";
import ProductImage from "@/components/media/ProductImage";
import { getStaffPicks } from "@/lib/catalog/staff-picks";
import { getProductThumbnail } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

export default function StaffPicksSection() {
  const picks = getStaffPicks();
  if (picks.length === 0) return null;

  return (
    <section
      className="border-b border-neutral-200 bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Staff picks"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
            Our Team's Picks
          </p>
          <h2 className="mt-1 text-xl font-bold text-neutral-900 sm:text-2xl">
            What we'd grab off the shelf
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Editorial picks from the DrivoraParts team — real listings, honest reasoning.
          </p>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((pick, index) => (
            <ScrollReveal key={pick.categorySlug} delayMs={index * 80}>
              <Link
                href={routes.product(pick.product.id)}
                prefetch={false}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:border-accent-border hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              >
                <div className="aspect-square w-full overflow-hidden border-b border-neutral-100 bg-neutral-50">
                  <ProductImage
                    src={getProductThumbnail(pick.product)}
                    alt={pick.product.name}
                    profile="card"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 text-sm font-bold text-neutral-900 group-hover:text-accent-hover">
                    {pick.product.name}
                  </h3>
                  <ProductPrice
                    price={pick.product.price}
                    compareAtPrice={pick.product.compareAtPrice}
                    size="sm"
                    className="mt-1"
                  />
                  <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                    {pick.reason}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
