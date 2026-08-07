import HomeCategoryGrid from "@/components/home/HomeCategoryGrid";

export default function PopularCategoriesSection() {
  return (
    <section className="border-b border-neutral-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
            Popular Categories
          </p>
          <h2 className="mt-1 text-xl font-bold text-neutral-900 sm:text-2xl">
            Browse by category
          </h2>
        </div>

        <HomeCategoryGrid />
      </div>
    </section>
  );
}
