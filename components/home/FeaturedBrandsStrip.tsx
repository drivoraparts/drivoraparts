import ScrollReveal from "./ScrollReveal";
import { BRAND_ASSETS } from "@/lib/content/brand-assets";

function BrandMark({ brand }: { brand: (typeof BRAND_ASSETS)[number] }) {
  if (brand.logo) {
    return (
      <img
        src={brand.logo.src}
        alt={brand.name}
        loading="lazy"
        decoding="async"
        className={`h-7 w-auto shrink-0 select-none object-contain opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0 sm:h-8 ${
          brand.logo.padded ? "rounded-md bg-white p-1.5 shadow-sm" : ""
        }`}
      />
    );
  }

  return (
    <span className="select-none whitespace-nowrap text-xl font-bold tracking-tight text-neutral-400 transition-colors duration-200 hover:text-neutral-900 sm:text-2xl">
      {brand.name}
    </span>
  );
}

export default function FeaturedBrandsStrip() {
  const loop = [...BRAND_ASSETS, ...BRAND_ASSETS];

  return (
    <section
      className="border-b border-neutral-200 bg-neutral-50 py-12 sm:py-16"
      aria-label="Featured brands"
    >
      <ScrollReveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">
          Shop Parts By Brand
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
            <div
              key={`${brand.slug}-${index}`}
              className="flex shrink-0 items-center gap-x-8 sm:gap-x-10"
              role="listitem"
            >
              <BrandMark brand={brand} />
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
