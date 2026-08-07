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
          Compatible Brands
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Parts for the makes and brands builders trust
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Listings span performance, OEM, and aftermarket parts compatible with these
          manufacturers — Drivora is an independent marketplace, not an authorized dealer.
        </p>
      </ScrollReveal>

      <div
        className="brand-marquee-mask relative mt-10 overflow-hidden"
        role="list"
        aria-label="Brands we carry parts for"
      >
        <div className="brand-marquee-track flex w-max items-center gap-x-8 pl-8 sm:gap-x-10">
          {loop.map((brand, index) => (
            <div key={`${brand}-${index}`} className="flex shrink-0 items-center gap-x-8 sm:gap-x-10">
              <span
                role="listitem"
                className="select-none whitespace-nowrap text-xl font-bold tracking-tight text-neutral-400 transition-colors duration-200 hover:text-neutral-900 sm:text-2xl"
              >
                {brand}
              </span>
              <span
                aria-hidden="true"
                className="h-1 w-1 shrink-0 rounded-full bg-neutral-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
