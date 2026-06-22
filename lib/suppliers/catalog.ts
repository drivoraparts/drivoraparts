import type { Supplier } from "./types";

export const suppliers: Supplier[] = [
  {
    id: "sup-euro-engine",
    name: "Euro Engine Supply Co.",
    categories: ["engine"],
    regions: ["EU", "US"],
    leadTimeDays: 7,
    reliabilityScore: 94,
    specialties: ["bmw", "audi", "mercedes", "euro-performance"],
  },
  {
    id: "sup-jdm",
    name: "JDM Legends Wholesale",
    categories: ["engine"],
    regions: ["JP", "US"],
    leadTimeDays: 10,
    reliabilityScore: 91,
    specialties: ["japanese-legends", "honda", "nissan", "mazda"],
  },
  {
    id: "sup-v8",
    name: "American V8 Direct",
    categories: ["engine"],
    regions: ["US"],
    leadTimeDays: 5,
    reliabilityScore: 89,
    specialties: ["american-v8", "hellcat", "coyote", "ls"],
  },
  {
    id: "sup-turbo",
    name: "Turbo Performance Partners",
    categories: ["turbocharger", "engine"],
    regions: ["US", "EU"],
    leadTimeDays: 6,
    reliabilityScore: 88,
    specialties: ["turbo", "forced-induction"],
  },
  {
    id: "sup-general",
    name: "Drivora General Parts Network",
    categories: ["brakes", "suspension", "electronics", "body-parts"],
    regions: ["US", "EU"],
    leadTimeDays: 4,
    reliabilityScore: 86,
    specialties: ["aftermarket", "performance"],
  },
];

export function getSuppliers(): Supplier[] {
  return suppliers;
}

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find((supplier) => supplier.id === id);
}
