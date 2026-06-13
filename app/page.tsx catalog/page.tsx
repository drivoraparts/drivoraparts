import { products } from "@/data/products";

export default function CatalogPage() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>All Products</h1>

      <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
        {products.map((p) => (
          <div key={p.id} style={{ padding: "15px", border: "1px solid #ddd" }}>
            <h2>{p.name}</h2>
            <p>{p.category}</p>
            <p>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}