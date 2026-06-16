import { products } from "@/data/products";

type Props = {
  params: {
    category: string;
  };
};

// REQUIRED for next export
export async function generateStaticParams() {
  const categories = Array.from(
    new Set(products.map((p) => p.category))
  );

  return categories.map((category) => ({
    category,
  }));
}

export default function CategoryPage({ params }: Props) {
  const filtered = products.filter(
    (p) => p.category === params.category
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Category: {params.category}
      </h1>

      <div style={{ marginTop: "20px" }}>
        {filtered.length === 0 ? (
          <p>No products found in this category.</p>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h2>{product.name}</h2>
              <p>{product.price}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}