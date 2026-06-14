import Link from "next/link";
import { products } from "@/data/products";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const filtered = products.filter(
    (p) => p.category === category
  );

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
      <h1
        style={{
          fontSize: "34px",
          fontWeight: "bold",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        {category}
      </h1>

      <p style={{ color: "#aaa", marginTop: 5 }}>
        Premium performance parts marketplace
      </p>

      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            style={{
              background: "#111118",
              borderRadius: 16,
              overflow: "hidden",
              textDecoration: "none",
              color: "white",
              border: "1px solid #222",
            }}
          >
            <div
              style={{
                height: 200,
                overflow: "hidden",
                background: "#000",
              }}
            >
              <img
                src={p.thumbnail}
                alt={p.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <div style={{ padding: 15 }}>
              <h3 style={{ fontSize: 16 }}>{p.name}</h3>

              <p style={{ fontSize: 12, color: "#888" }}>
                {p.condition} • {p.location}
              </p>

              <div
                style={{
                  marginTop: 10,
                  color: "#00ff88",
                  fontWeight: "bold",
                }}
              >
                ${p.price}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}