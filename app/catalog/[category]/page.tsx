import { getCategory, slugify } from "@/data/store";
import { routes } from "@/lib/inventory";
import CategoryTemplate from "@/components/catalog/CategoryTemplate";

export default async function Page({ params }: any) {
  const { category: slug } = await params;

  const categoryData = getCategory(slug);

  // Self-healing: never hard-404 a catalog category — show a clean fallback.
  if (!categoryData) {
    return (
      <div className="text-white p-6">No products found in this category</div>
    );
  }

  return (
    <CategoryTemplate
      title={categoryData.name}
      brands={categoryData.brands.map((brand) => ({
        name: brand,
        href: routes.brand(slug, slugify(brand)),
      }))}
      products={categoryData.products}
    />
  );
}
