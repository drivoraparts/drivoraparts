import { notFound } from "next/navigation";
import { getProductById } from "@/data/store";
import ProductTemplate from "@/components/product/ProductTemplate";

export const runtime = "edge";

export default async function ProductPage({ params }: any) {
  const { id } = await params;
  const product = getProductById(Number(id));

  if (!product) return notFound();

  return <ProductTemplate product={product} />;
}
