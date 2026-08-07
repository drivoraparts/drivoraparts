import ScrollReveal from "./ScrollReveal";

// Real brands carried in the catalog (lib/inventory/brands.ts) — curated for
// display breadth (vehicle makes + performance component brands).
const FEATURED_BRANDS = [
  "BMW",
  "Toyota",
  "Ford",
  "Chevrolet",
  "Nissan",
  "Honda",
  "Audi",
  "Mercedes-Benz",
  "Jeep",
  "GMC",
  "Garrett",
  "Brembo",
  "Wilwood",
  "Bilstein",
  "Fox Racing Shox",
  "ARB",
  "Holley",
  "AEM",
  "MSD",
  "BFGoodrich",
  "Michelin",
  "Rough Country",
] as const;

export default function FeaturedBrandsStrip() {
  const loop = [...FEATURED_BRANDS, ...FEATURED_BRANDS];

  return (
    <section
      className="border-b border-neutral-200 bg-neutral-50 py-12 sm:py-16"
      aria-label="Featured brands"
    >
      <ScrollReveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">
          Featured Brands
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Parts for the makes and brands builders trust
        </h2>
      </ScrollReveal>

      <div
        className="brand-marquee-mask relative mt-10 overflow-hidden"
        role="list"
        aria-label="Brands we carry parts for"
      >
        <div className="brand-marquee-track flex w-max items-center gap-x-12 pl-12 sm:gap-x-16">
          {loop.map((brand, index) => (
            <span
              key={`${brand}-${index}`}
              role="listitem"
              className="shrink-0 select-none text-lg font-bold tracking-tight text-neutral-300 transition-colors hover:text-neutral-500 sm:text-xl"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
