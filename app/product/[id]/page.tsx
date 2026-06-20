import { notFound } from "next/navigation";
import { getProductById } from "@/data/store";
import { getProductById as getInventoryProduct } from "@/lib/inventory";
import ProductGallery from "@/app/components/ProductGallery";
import ProductDetailsPanel from "@/app/components/ProductDetailsPanel";

export const runtime = "edge";

export default async function ProductPage({ params }: any) {
  const { id } = await params;

  const product = getProductById(Number(id));

  if (!product) return notFound();

  const inventoryProduct = getInventoryProduct(Number(id));
  const inStock = inventoryProduct?.stock !== false;

  const primaryImage = product.images?.[0] || product.thumbnail;
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
        gap: "30px",
        alignItems: "start",
      }}
      className="product-page-grid"
    >
      <div style={{ minWidth: 0, maxWidth: "100%", position: "relative" }}>
        <ProductGallery images={galleryImages} alt={product.name} />
      </div>

      <ProductDetailsPanel
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          condition: product.condition,
          brand: product.brand,
          category: product.category,
          location: product.location,
          description: product.description,
          primaryImage,
          inStock,
          platform: product.platform,
        }}
      />

      <style>{`
        @media (max-width: 768px) {
          .product-page-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
