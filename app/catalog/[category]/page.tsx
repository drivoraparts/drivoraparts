import Link from "next/link";
import { products } from "../../../data/products";

export async function generateStaticParams() {
  const categories = [...new Set(products.map((p) => p.category))];

  return categories.map((category) => ({
    category,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const filtered = products.filter(
    (p) => p.category === category
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>{category}</h1>

      {filtered.length === 0 ? (
        <p>No products found.</p>
      ) : (
        filtered.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h2>{product.name}</h2>
            <p>${product.price}</p>

            <Link href={`/product/${product.id}`}>
              View Product
            </Link>
          </div>
        ))
      )}
    </div>
  );
}