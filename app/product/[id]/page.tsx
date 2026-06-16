import { products } from "../../../data/products";

type Props = {
  params: {
    id: string;
  };
};

// REQUIRED for static export
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export default function ProductPage({ params }: Props) {
  const product = products.find(
    (p) => p.id.toString() === params.id
  );

  if (!product) {
    return (
      <h1 style={{ padding: "20px" }}>
        Product not found
      </h1>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "bold" }}>
        {product.name}
      </h1>

      <p style={{ marginTop: "10px" }}>
        Price: {product.price}
      </p>

      <p style={{ marginTop: "10px" }}>
        Category: {product.category}
      </p>
    </div>
  );
}