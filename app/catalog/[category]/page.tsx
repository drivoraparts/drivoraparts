import { products } from "@/data/products";

export function generateStaticParams() {
  return [
    { category: "engines" },
    { category: "turbochargers" },
    { category: "ecu-modules" },
    { category: "transmissions" },
    { category: "headlights" },
    { category: "bumpers" },
  ];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const filteredProducts = products.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div
      style={{
        padding: "40px",
        background: "#0f0f0f",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <h1>{category.toUpperCase()}</h1>

      <div style={{ marginTop: "20px" }}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#1a1a1a",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
              }}
            >
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p>${p.price}</p>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}