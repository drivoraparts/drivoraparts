/* =========================================================
   DRIVORAPARTS — DATA LAYER (SINGLE SOURCE OF TRUTH)
   ---------------------------------------------------------
   - Every category owns its data (name, brands, products).
   - No shared product arrays.
   - No engine fallback.
   - product.category MUST equal its parent store key.
   - product.brand MUST belong to the category's brands.
========================================================= */

export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  /** Engine system only: the engine platform slug this product belongs to. */
  platform?: string;
  price: number;
  condition: string;
  location: string;
  thumbnail: string;
  images: string[];
  description: string;
};

export type Category = {
  name: string;
  brands: string[];
  products: Product[];
};

export const store: Record<string, Category> = {
  engine: {
    name: "Engine",
    brands: ["BMW", "Toyota", "Nissan", "Honda", "Mazda"],
    products: [
      {
        id: 1,
        name: "BMW N54 Twin Turbo Engine",
        category: "engine",
        brand: "BMW",
        platform: "bmw-n54-twin-turbo",
        price: 3200,
        condition: "Used - Refurbished",
        location: "USA Warehouse",
        thumbnail: "/engines/engine-1.jpg",
        images: [
          "/engines/engine-1.jpg",
          "/engines/engine-2.jpg",
          "/engines/engine-3.jpg",
        ],
        description:
          "High-performance BMW N54 twin turbo engine fully tested and rebuilt for maximum power output.",
      },
    ],
  },

  turbocharger: {
    name: "Turbocharger",
    brands: ["Garrett", "BorgWarner", "Precision"],
    products: [
      {
        id: 2,
        name: "Garrett GTX3076R Turbocharger",
        category: "turbocharger",
        brand: "Garrett",
        price: 850,
        condition: "New",
        location: "UK Warehouse",
        thumbnail: "/turbochargers/turbo-1.jpg",
        images: ["/turbochargers/turbo-1.jpg", "/turbochargers/turbo-2.jpg"],
        description:
          "Premium Garrett turbocharger designed for extreme boost performance and reliability.",
      },
    ],
  },

  transmission: {
    name: "Transmission",
    brands: [],
    products: [],
  },

  suspension: {
    name: "Suspension",
    brands: [],
    products: [],
  },

  brakes: {
    name: "Brakes",
    brands: [
      "Brembo GT Kits",
      "Wilwood Big Brake Kits",
      "EBC Rotors & Pads",
      "ATE OEM Kits",
    ],
    products: [],
  },

  electronics: {
    name: "Electronics",
    brands: [],
    products: [],
  },

  lighting: {
    name: "Lighting",
    brands: [],
    products: [],
  },

  "body-parts": {
    name: "Body Parts",
    brands: [],
    products: [],
  },

  interior: {
    name: "Interior",
    brands: [],
    products: [],
  },
};

/* =========================
   HELPERS (DERIVED — NOT A SECOND SOURCE)
========================= */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategory(slug: string): Category | undefined {
  return Object.prototype.hasOwnProperty.call(store, slug)
    ? store[slug]
    : undefined;
}

export function getBrand(
  categorySlug: string,
  brandSlug: string
): string | undefined {
  const category = getCategory(categorySlug);
  if (!category) return undefined;
  return category.brands.find((brand) => slugify(brand) === brandSlug);
}

export function getCategoryList(): { slug: string; name: string }[] {
  return Object.entries(store).map(([slug, category]) => ({
    slug,
    name: category.name,
  }));
}

export function getAllProducts(): Product[] {
  return Object.values(store).flatMap((category) => category.products);
}

export function getProductById(id: number): Product | undefined {
  return getAllProducts().find((product) => product.id === id);
}
