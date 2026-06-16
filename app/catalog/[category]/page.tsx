import { products } from "../../../data/products";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export async function generateStaticParams() {
  const categories = Array.from(
    new Set(products.map((p) => p.category))
  );

  return categories.map((category) => ({
    category,
  }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const filtered = products.filter(
    (p) => p.category === category
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>{category}</h1>

      {filtered.map((p) => (
        <div key={p.id}>
          <h2>{p.name}</h2>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}