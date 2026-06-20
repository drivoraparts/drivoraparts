import { notFound } from "next/navigation";
import { getCategory, slugify } from "@/data/store";
import CategoryTemplate from "@/components/catalog/CategoryTemplate";

export const runtime = "edge";

export default async function Page({ params }: any) {
  const { category: slug } = await params;

  const category = getCategory(slug);
  if (!category) return notFound();

  return (
    <CategoryTemplate
      title={category.name}
      brands={category.brands.map((brand) => ({
        name: brand,
        href: `/catalog/${slug}/${slugify(brand)}`,
      }))}
      products={category.products}
    />
  );
}
