export default function ProductCard({ product }: any) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "15px",
        borderRadius: "10px",
        color: "white",
      }}
    >
      {/* IMAGE */}
      <img
        src={product.thumbnail}
        alt={product.name}
        style={{
          width: "100%",
          height: "160px",
          objectFit: "cover",
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      />

      {/* TEXT (UNCHANGED) */}
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <p style={{ color: "#aaa" }}>{product.category}</p>

      {/* BUTTON (NO CART YET — SAFE) */}
      <button
        style={{
          marginTop: "10px",
          padding: "8px",
          width: "100%",
          background: "white",
          color: "black",
          borderRadius: "6px",
          border: "none",
        }}
      >
        View Item
      </button>
    </div>
  );
}