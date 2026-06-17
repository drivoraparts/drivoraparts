export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  condition: string;
  location: string;
  thumbnail: string;
  images: string[];
  description: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "BMW N54 Twin Turbo Engine",
    category: "engines",
    price: 3200,
    condition: "Used - Refurbished",
    location: "USA Warehouse",
    thumbnail: "/engines/engine-1.jpg",
    images: [
      "/engines/engine-1.jpg",
      "/engines/engine-2.jpg",
      "/engines/engine-3.jpg"
    ],
    description:
      "High-performance BMW N54 twin turbo engine fully tested and rebuilt for maximum power output."
  },
  {
    id: 2,
    name: "Garrett GTX3076R Turbocharger",
    category: "turbochargers",
    price: 850,
    condition: "New",
    location: "UK Warehouse",
    thumbnail: "/turbochargers/turbo-1.jpg",
    images: [
      "/turbochargers/turbo-1.jpg",
      "/turbochargers/turbo-2.jpg"
    ],
    description:
      "Premium Garrett turbocharger designed for extreme boost performance and reliability."
  }
];