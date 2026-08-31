import Link from "next/link";
import ScrollReveal from "@/components/home/ScrollReveal";
import { categories } from "@/lib/inventory/categories";
import { getAllProducts } from "@/lib/inventory";
import { routes } from "@/lib/inventory/routes";

const QUICK_CATEGORY_SLUGS = [
  "engine",
  "transmission",
  "turbocharger",
  "suspension",
  "brakes",
  "body-parts",
  "lighting",
  "wheels-tires",
];

export default function CatalogHero() {
  const productCount = getAllProducts().length;
  const quickCategories = categories.filter((c) =>
    QUICK_CATEGORY_SLUGS.includes(c.slug)
  );

  return (
    <section className="border-b border-neutral-200 bg-neutral-950 px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
      <ScrollReveal className="mx-auto max-w-4xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-on-dark">
          The Marketplace
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Explore Every Build-Ready Part
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
          {productCount.toLocaleString()}+ listings across engines,
          transmissions, suspension, brakes, and more — what you see is what
          you get.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {quickCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={routes.category(cat.slug)}
              prefetch={false}
              className="touch-manipulation rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:border-red-400/60 hover:bg-white/10 hover:text-white"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
