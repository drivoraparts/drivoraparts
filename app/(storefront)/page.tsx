import HomeHero from "@/components/home/HomeHero";
import HomeStorySections from "@/components/home/HomeStorySections";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import { getAllProducts } from "@/lib/inventory";

export default function HomePage() {
  const productCount = getAllProducts().length;

  return (
    <div className="relative z-0 bg-black text-white">
      <HomeHero productCount={productCount} />
      <FeaturedProductsSection />
      <HomeStorySections />
    </div>
  );
}
