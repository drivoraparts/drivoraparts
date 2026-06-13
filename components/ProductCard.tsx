export default function ProductCard({ product }: any) {
  return (
    <div style={{
      background: "#1a1a1a",
      padding: "15px",
      borderRadius: "10px",
      color: "white"
    }}>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <p style={{ color: "#aaa" }}>{product.category}</p>

      <button style={{
        marginTop: "10px",
        padding: "8px",
        width: "100%",
        background: "white",
        color: "black",
        borderRadius: "6px"
      }}>
        View Item
      </button>
    </div>
  );
}