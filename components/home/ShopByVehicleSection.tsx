import ScrollReveal from "./ScrollReveal";
import ShopByVehicleFinder from "@/components/vehicle/ShopByVehicleFinder";

export default function ShopByVehicleSection() {
  return (
    <section
      className="border-b border-neutral-200 bg-neutral-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      aria-label="Shop by vehicle"
    >
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">
            Shop by Vehicle
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-[2rem]">
            Tell us what you drive, we&apos;ll find what fits
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Search our catalog by year, make, model, and engine to narrow in
            on compatible parts fast.
          </p>
        </ScrollReveal>

        <ScrollReveal delayMs={100}>
          <ShopByVehicleFinder className="mx-auto mt-10 max-w-3xl" />
        </ScrollReveal>
      </div>
    </section>
  );
}
