import { products } from "../../../data/products";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export async function generateStaticParams() {
  const categories = Array.from(
    new Set(products.map((p) => p.category))
  );

  return categories.map((category) => ({
    category,
  }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const filtered = products.filter(
    (p) => p.category === category
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Category: {category}
      </h1>

      <div style={{ marginTop: "20px" }}>
        {filtered.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
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