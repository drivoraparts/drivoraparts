import ShopByVehicleFinder from "@/components/vehicle/ShopByVehicleFinder";

export default function CatalogVehicleFinderSection() {
  return (
    <section
      className="border-b border-neutral-200 bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Shop by vehicle"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
            Shop by Vehicle
          </p>
          <h2 className="mt-1 text-xl font-bold text-neutral-900 sm:text-2xl">
            Find compatible parts fast
          </h2>
        </div>

        <ShopByVehicleFinder className="mx-auto mt-8 max-w-3xl" />
      </div>
    </section>
  );
}
