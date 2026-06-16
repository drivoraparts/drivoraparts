import { products } from "../../../data/products";

type Props = {
  params: {
    category: string;
  };
};

export async function generateStaticParams() {
  const categories = Array.from(
    new Set(products.map((p) => p.category))
  );

  return categories.map((category) => ({
    category,
  }));
}

export default function CategoryPage({ params }: Props) {
  const filtered = products.filter(
    (p) => p.category === params.category
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>{params.category}</h1>

      {filtered.map((p) => (
        <div key={p.id}>
          {p.name} - {p.price}
        </div>
      ))}
    </div>
  );
}