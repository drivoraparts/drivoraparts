type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  condition: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div style={{
      background: "#1a1a1a",
      padding: "15px",
      borderRadius: "10px",
      border: "1px solid #333"
    }}>
      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <p>${product.price}</p>
      <p>{product.condition}</p>
    </div>
  );
}