import { products } from "@/data/products";
import AddToCartButton from "@/app/components/AddToCartButton";

export const runtime = "edge";

export default function ProductPage({ params }: any) {
  const { id } = params;

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "30px",
      }}
    >
      {/* LEFT SIDE */}
      <div>
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <img
            src={product.images?.[0] || product.thumbnail}
            alt={product.name}
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="thumb"
              style={{
                width: "70px",
                height: "70px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div>
        <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
          {product.name}
        </h1>

        <p style={{ fontSize: "14px", color: "#666" }}>
          Category: <b>{product.category}</b>
        </p>

        <p style={{ fontSize: "18px", marginTop: "10px" }}>
          Condition: {product.condition}
        </p>

        <h2 style={{ marginTop: "15px", fontSize: "26px" }}>
          ${product.price}
        </h2>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #eee",
            borderRadius: "10px",
          }}
        >
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              thumbnail: product.thumbnail,
            }}
          />

          <button
            style={{
              width: "100%",
              padding: "12px",
              background: "#232f3e",
              color: "white",
              border: "none",
              borderRadius: "6px",
              marginTop: "10px",
            }}
          >
            Buy Now
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>Description</h3>
          <p style={{ color: "#444", lineHeight: "1.6" }}>
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}