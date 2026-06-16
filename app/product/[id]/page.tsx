import { products } from "@/data/products";
import ProductGallery from "./ProductGallery";

export async function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id) }));
}

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const product = products.find(
    (p) => p.id === Number(id)
  );

  if (!product) {
    return (
      <div style={{ color: "white", padding: 40 }}>
        Product not found
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#07070a",
        minHeight: "100vh",
        padding: "50px 20px",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32 }}>{product.name}</h1>

          <p style={{ color: "#888", marginTop: 10 }}>
            {product.condition} • {product.location}
          </p>

          <p style={{ marginTop: 20, color: "#ccc" }}>
            {product.description}
          </p>

          <h2
            style={{
              marginTop: 20,
              color: "#00ff88",
              fontSize: 28,
            }}
          >
            ${product.price}
          </h2>

          <button
            style={{
              marginTop: 25,
              padding: "14px 20px",
              background: "#00ff88",
              border: "none",
              borderRadius: 10,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Buy Now
          </button>
        </div>

        <ProductGallery product={product} />
      </div>
    </div>
  );
}